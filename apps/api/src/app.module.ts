import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { CsrfGuard } from './common/http';
import { ContentModule } from './content/content.module';
import { DbModule } from './db/db.module';
import { HealthModule } from './health/health.module';
import { MediaModule } from './media/media.module';
import { MessagesModule } from './messages/messages';

// Planned next (docs/ARQUITETURA.md): visits, for Cris to log client visits from her phone.
@Module({
  imports: [DbModule, CommonModule, AuthModule, HealthModule, ContentModule, MediaModule, MessagesModule],
  providers: [{ provide: APP_GUARD, useClass: CsrfGuard }],
})
export class AppModule {}
