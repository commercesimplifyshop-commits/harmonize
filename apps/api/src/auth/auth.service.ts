import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuthUser } from '@harmonize/shared';
import { createHash, randomBytes, randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { RateLimitService } from '../common/rate-limit.service';
import { config } from '../config';
import { DbService } from '../db/db.service';
import { dummyHash, hashPassword, verifyPassword } from './passwords';

export const ACCESS_TTL_SECONDS = 15 * 60;
export const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;

const MAX_FAILED_ATTEMPTS = 8;
const LOCK_MINUTES = 15;
// Two tabs refreshing at once both present the same token; the slower one shouldn't kill the session.
const REUSE_GRACE_SECONDS = 30;

type UserRow = {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  failed_attempts: number;
  locked_until: Date | null;
  password_changed_at: Date;
};

type TokenRow = { id: number; user_id: number; family_id: string; expires_at: Date; revoked_at: Date | null };

export type Session = { user: AuthUser; accessToken: string; refreshToken: string };
export type AccessClaims = { sub: number; name: string; email: string; pwd: number };

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DbService,
    private readonly limits: RateLimitService,
  ) {}

  async login(email: string, password: string, ip: string, ua: string): Promise<Session> {
    const normalized = email.trim().toLowerCase();
    // Per IP (spraying many accounts) and per account (guessing one password from many IPs).
    await this.limits.hit(`login:ip:${ip}`, 20, 15 * 60);
    await this.limits.hit(`login:user:${normalized}`, 30, 60 * 60);

    const user = await this.db.one<UserRow>('SELECT * FROM users WHERE email = ?', [normalized]);
    const ok = await verifyPassword(user?.password_hash ?? (await dummyHash()), password);

    if (user?.locked_until && new Date(user.locked_until) > new Date()) {
      throw new HttpException('Muitas tentativas. Aguarde alguns minutos e tente de novo.', HttpStatus.TOO_MANY_REQUESTS);
    }
    if (!user || !ok) {
      if (user) {
        await this.db.run(
          `UPDATE users SET failed_attempts = failed_attempts + 1,
             locked_until = IF(failed_attempts + 1 >= ?, UTC_TIMESTAMP() + INTERVAL ? MINUTE, NULL)
           WHERE id = ?`,
          [MAX_FAILED_ATTEMPTS, LOCK_MINUTES, user.id],
        );
      }
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    await this.db.run('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?', [user.id]);
    return this.issue(user, randomUUID(), ip, ua);
  }

  /** Rotates the refresh token. Presenting an already-rotated token revokes the whole family. */
  async refresh(refreshToken: string | undefined, ip: string, ua: string): Promise<Session> {
    if (!refreshToken) throw new UnauthorizedException('Sessão expirada.');
    const row = await this.db.one<TokenRow>('SELECT * FROM refresh_tokens WHERE token_hash = ?', [sha256(refreshToken)]);
    if (!row) throw new UnauthorizedException('Sessão expirada.');

    if (row.revoked_at) {
      const revokedAgo = (Date.now() - new Date(row.revoked_at).getTime()) / 1000;
      if (revokedAgo > REUSE_GRACE_SECONDS) {
        await this.db.run('UPDATE refresh_tokens SET revoked_at = UTC_TIMESTAMP() WHERE family_id = ? AND revoked_at IS NULL', [row.family_id]);
      }
      throw new UnauthorizedException('Sessão expirada.');
    }
    if (new Date(row.expires_at) <= new Date()) throw new UnauthorizedException('Sessão expirada.');

    const user = await this.db.one<UserRow>('SELECT * FROM users WHERE id = ?', [row.user_id]);
    if (!user) throw new UnauthorizedException('Sessão expirada.');

    await this.db.run('UPDATE refresh_tokens SET revoked_at = UTC_TIMESTAMP() WHERE id = ?', [row.id]);
    return this.issue(user, row.family_id, ip, ua);
  }

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) return;
    const row = await this.db.one<TokenRow>('SELECT family_id FROM refresh_tokens WHERE token_hash = ?', [sha256(refreshToken)]);
    if (row) await this.db.run('UPDATE refresh_tokens SET revoked_at = UTC_TIMESTAMP() WHERE family_id = ? AND revoked_at IS NULL', [row.family_id]);
  }

  /** Changing the password signs out every other session (old access tokens stop matching `pwd`). */
  async changePassword(userId: number, current: string, next: string, ip: string, ua: string): Promise<Session> {
    await this.limits.hit(`password:user:${userId}`, 10, 15 * 60);
    const user = await this.db.one<UserRow>('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user || !(await verifyPassword(user.password_hash, current))) {
      throw new UnauthorizedException('A senha atual não confere.');
    }
    await this.db.run('UPDATE users SET password_hash = ?, password_changed_at = UTC_TIMESTAMP() WHERE id = ?', [await hashPassword(next), userId]);
    await this.db.run('UPDATE refresh_tokens SET revoked_at = UTC_TIMESTAMP() WHERE user_id = ? AND revoked_at IS NULL', [userId]);
    const updated = await this.db.one<UserRow>('SELECT * FROM users WHERE id = ?', [userId]);
    return this.issue(updated!, randomUUID(), ip, ua);
  }

  /** Validates an access token and checks it was issued after the last password change. */
  async verifyAccess(token: string | undefined): Promise<AuthUser | null> {
    if (!token) return null;
    let claims: AccessClaims;
    try {
      claims = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] }) as unknown as AccessClaims;
    } catch {
      return null;
    }
    const user = await this.db.one<{ password_changed_at: Date }>('SELECT password_changed_at FROM users WHERE id = ?', [claims.sub]);
    if (!user || Math.floor(new Date(user.password_changed_at).getTime() / 1000) !== claims.pwd) return null;
    return { id: claims.sub, name: claims.name, email: claims.email };
  }

  private async issue(user: UserRow, familyId: string, ip: string, ua: string): Promise<Session> {
    const authUser: AuthUser = { id: user.id, name: user.name, email: user.email };
    const claims: AccessClaims = {
      sub: user.id,
      name: user.name,
      email: user.email,
      pwd: Math.floor(new Date(user.password_changed_at).getTime() / 1000),
    };
    const accessToken = jwt.sign(claims, config.jwtSecret, { algorithm: 'HS256', expiresIn: ACCESS_TTL_SECONDS });
    const refreshToken = randomBytes(32).toString('base64url');
    await this.db.run(
      `INSERT INTO refresh_tokens (user_id, family_id, token_hash, expires_at, ip, user_agent)
       VALUES (?, ?, ?, UTC_TIMESTAMP() + INTERVAL ? SECOND, ?, ?)`,
      [user.id, familyId, sha256(refreshToken), REFRESH_TTL_SECONDS, ip, ua],
    );
    // Housekeeping: expired tokens are useless; keep the table small.
    await this.db.run('DELETE FROM refresh_tokens WHERE user_id = ? AND expires_at < UTC_TIMESTAMP()', [user.id]);
    return { user: authUser, accessToken, refreshToken };
  }
}
