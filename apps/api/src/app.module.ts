import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';

// v2 modules, in build order (details in docs/ARQUITETURA.md):
// database (MySQL), auth, settings, pages, banners, events, media (uploads), contact, visits.
@Module({
  imports: [HealthModule],
})
export class AppModule {}
