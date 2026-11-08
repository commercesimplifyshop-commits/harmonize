import { CanActivate, createParamDecorator, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuthUser } from '@harmonize/shared';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { ACCESS_COOKIE } from './cookies';

type AuthedRequest = Request & { user?: AuthUser };

/** Protects every /api/admin route: valid access cookie or 401 (the panel then calls /auth/refresh). */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const user = await this.auth.verifyAccess(req.cookies?.[ACCESS_COOKIE]);
    if (!user) throw new UnauthorizedException({ message: 'Faça login novamente.', code: 'unauthenticated' });
    req.user = user;
    return true;
  }
}

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext): AuthUser => {
  return context.switchToHttp().getRequest<AuthedRequest>().user!;
});
