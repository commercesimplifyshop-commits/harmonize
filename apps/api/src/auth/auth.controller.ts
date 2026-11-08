import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { AuthUser } from '@harmonize/shared';
import type { Request, Response } from 'express';
import { clientIp, userAgent } from '../common/http';
import { RecaptchaService } from '../common/recaptcha.service';
import { ChangePasswordDto, LoginDto } from './auth.dto';
import { AdminGuard, CurrentUser } from './auth.guard';
import { AuthService } from './auth.service';
import { clearSessionCookies, REFRESH_COOKIE, setSessionCookies } from './cookies';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly recaptcha: RecaptchaService,
  ) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<AuthUser> {
    await this.recaptcha.verify(dto.captchaToken, 'login', clientIp(req));
    const session = await this.auth.login(dto.email, dto.password, clientIp(req), userAgent(req));
    setSessionCookies(res, session);
    return session.user;
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<AuthUser> {
    try {
      const session = await this.auth.refresh(req.cookies?.[REFRESH_COOKIE], clientIp(req), userAgent(req));
      setSessionCookies(res, session);
      return session.user;
    } catch (err) {
      clearSessionCookies(res);
      throw err;
    }
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(req.cookies?.[REFRESH_COOKIE]);
    clearSessionCookies(res);
  }

  @Get('me')
  @UseGuards(AdminGuard)
  me(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }

  @Post('password')
  @HttpCode(200)
  @UseGuards(AdminGuard)
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthUser> {
    const session = await this.auth.changePassword(user.id, dto.currentPassword, dto.newPassword, clientIp(req), userAgent(req));
    setSessionCookies(res, session);
    return session.user;
  }
}
