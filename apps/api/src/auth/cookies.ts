import type { CookieOptions, Response } from 'express';
import { config } from '../config';
import { ACCESS_TTL_SECONDS, REFRESH_TTL_SECONDS, type Session } from './auth.service';

export const ACCESS_COOKIE = 'hz_at';
export const REFRESH_COOKIE = 'hz_rt';

// HttpOnly: unreachable from JavaScript (XSS can't steal them). SameSite=Strict: never sent by
// other sites. Secure outside local dev. The refresh cookie only travels to /api/auth.
const base: CookieOptions = { httpOnly: true, sameSite: 'strict', secure: config.isHosted };
const accessOptions: CookieOptions = { ...base, path: '/api', maxAge: ACCESS_TTL_SECONDS * 1000 };
const refreshOptions: CookieOptions = { ...base, path: '/api/auth', maxAge: REFRESH_TTL_SECONDS * 1000 };

export function setSessionCookies(res: Response, session: Session) {
  res.cookie(ACCESS_COOKIE, session.accessToken, accessOptions);
  res.cookie(REFRESH_COOKIE, session.refreshToken, refreshOptions);
}

export function clearSessionCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, { ...accessOptions, maxAge: undefined });
  res.clearCookie(REFRESH_COOKIE, { ...refreshOptions, maxAge: undefined });
}
