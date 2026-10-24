import { Controller, Get } from '@nestjs/common';

/** Public liveness probe: GET /api/health. */
@Controller('health')
export class HealthController {
  @Get()
  health() {
    return { status: 'ok', service: 'harmonize-api', environment: process.env.NODE_ENV ?? 'development' };
  }
}
