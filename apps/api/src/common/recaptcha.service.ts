import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { config } from '../config';

type VerifyResponse = { success: boolean; score?: number; action?: string; 'error-codes'?: string[] };

/** reCAPTCHA v3. Skipped entirely while RECAPTCHA_SECRET is empty (local dev, before setup). */
@Injectable()
export class RecaptchaService {
  private readonly logger = new Logger(RecaptchaService.name);

  get enabled() {
    return !!config.recaptchaSecret;
  }

  async verify(token: string | undefined, action: string, ip: string) {
    if (!this.enabled) return;
    if (!token) throw new BadRequestException('Verificação de segurança ausente. Recarregue a página.');

    const body = new URLSearchParams({ secret: config.recaptchaSecret, response: token, remoteip: ip });
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', { method: 'POST', body });
    const data = (await res.json()) as VerifyResponse;

    if (!data.success || data.action !== action || (data.score ?? 0) < config.recaptchaMinScore) {
      this.logger.warn(`reCAPTCHA rejected (${action}): score=${data.score} errors=${data['error-codes']?.join(',')}`);
      throw new BadRequestException('Não foi possível confirmar que você não é um robô. Tente novamente.');
    }
  }
}
