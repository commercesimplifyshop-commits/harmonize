import { Global, Module } from '@nestjs/common';
import { RateLimitService } from './rate-limit.service';
import { RecaptchaService } from './recaptcha.service';

@Global()
@Module({
  providers: [RateLimitService, RecaptchaService],
  exports: [RateLimitService, RecaptchaService],
})
export class CommonModule {}
