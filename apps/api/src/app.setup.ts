import { BadRequestException, type INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { resolve } from 'path';
import { config } from './config';
import { corsOptions } from './cors-config';

/** Everything both entry points (local server and the Vercel function) need. */
export function setupApp(app: INestApplication) {
  // Every route lives under /api: site and api share one domain (HostGator, or a Vercel rewrite).
  app.setGlobalPrefix('api');
  const http = app.getHttpAdapter().getInstance() as express.Express;
  // Behind Vercel's proxy or Apache: needed for the real client IP used by rate limiting.
  http.set('trust proxy', 1);
  http.disable('x-powered-by');
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.enableCors(corsOptions);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      // One readable message for the panel instead of a list of constraint names.
      exceptionFactory: (errors) => {
        const error = errors[0];
        if (error?.constraints?.whitelistValidation) return new BadRequestException(`Campo não permitido: ${error.property}.`);
        const first = errors.flatMap((e) => Object.values(e.constraints ?? {}))[0];
        return new BadRequestException(first ?? 'Dados inválidos.');
      },
    }),
  );

  if (config.storageDriver === 'local') {
    http.use('/uploads', express.static(resolve(config.uploadDir), { maxAge: '365d', immutable: true, fallthrough: false }));
  }
}
