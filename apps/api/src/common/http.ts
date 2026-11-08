import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';

/** Header the site sends on every write. Browsers can't add it cross-site without a CORS preflight. */
export const CSRF_HEADER = 'x-requested-with';
export const CSRF_VALUE = 'harmonize';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF defense on top of SameSite=Strict cookies: any write must carry the custom header.
 * A form or image on another site can't send it, and CORS blocks scripts from other origins.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (SAFE_METHODS.has(req.method)) return true;
    if (req.get(CSRF_HEADER) !== CSRF_VALUE) throw new ForbiddenException('Requisição bloqueada.');
    return true;
  }
}

/** Client IP. Express resolves X-Forwarded-For because `trust proxy` is on (Vercel, Apache). */
export const clientIp = (req: Request) => (req.ip ?? req.socket.remoteAddress ?? 'unknown').slice(0, 64);

export const userAgent = (req: Request) => (req.get('user-agent') ?? '').slice(0, 255);
