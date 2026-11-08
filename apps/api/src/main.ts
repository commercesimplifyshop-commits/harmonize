import 'reflect-metadata';
import { config } from './config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  setupApp(app);
  await app.listen(config.port);
  console.log(`harmonize-api listening on http://localhost:${config.port}/api`);
}

bootstrap();
