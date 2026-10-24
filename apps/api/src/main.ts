import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { corsOptions } from './cors-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Every route lives under /api: the web build and the api share one domain on HostGator.
  app.setGlobalPrefix('api');
  app.enableCors(corsOptions);
  // Behind Apache/Passenger: needed for the real client IP (rate limiting on login, v2).
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);
  console.log(`harmonize-api listening on http://localhost:${port}/api`);
}

bootstrap();
