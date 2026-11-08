import 'reflect-metadata';
import type { Request, Response } from 'express';
import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app.setup';

// Vercel keeps warm instances alive between invocations: bootstrap Nest once per instance.
let cached: Promise<express.Express> | null = null;

async function bootstrap(): Promise<express.Express> {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), { bodyParser: false });
  setupApp(app);
  await app.init();
  return server;
}

export default async function handler(req: Request, res: Response) {
  cached ??= bootstrap().catch((err) => {
    cached = null;
    throw err;
  });
  const server = await cached;
  server(req, res);
}
