/**
 * Creates an admin account, or resets the password of an existing one (signing out its sessions).
 *   npm run db:create-user -w apps/api -- "Nome" email@exemplo.com
 */
import { randomBytes } from 'crypto';
import type { RowDataPacket } from 'mysql2';
import { hashPassword } from '../src/auth/passwords';
import { finish, pool } from './db';

async function main() {
  const [name, rawEmail] = process.argv.slice(2);
  if (!name || !rawEmail) {
    console.error('Uso: npm run db:create-user -w apps/api -- "Nome" email@exemplo.com');
    return finish(1);
  }
  const email = rawEmail.trim().toLowerCase();
  const password = randomBytes(12).toString('base64url').match(/.{1,4}/g)!.join('-');
  const hash = await hashPassword(password);

  const [rows] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE email = ?', [email]);
  if (rows.length > 0) {
    const id = rows[0].id as number;
    await pool.query(
      'UPDATE users SET password_hash = ?, password_changed_at = UTC_TIMESTAMP(), failed_attempts = 0, locked_until = NULL WHERE id = ?',
      [hash, id],
    );
    await pool.query('UPDATE refresh_tokens SET revoked_at = UTC_TIMESTAMP() WHERE user_id = ? AND revoked_at IS NULL', [id]);
    console.log(`Senha redefinida para ${email}: ${password}`);
  } else {
    await pool.query('INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)', [email, name, hash]);
    console.log(`Conta criada: ${name} <${email}>  senha: ${password}`);
  }
}

main().then(
  () => finish(),
  (err) => {
    console.error(err);
    return finish(1);
  },
);
