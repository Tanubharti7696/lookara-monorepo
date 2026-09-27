// apps/backend/src/main.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/transform.interceptor';
import { GlobalHttpExceptionFilter } from './common/http-exception.filter';

import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Enable CORS for all portals
  const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim());
  app.enableCors({
    origin: allowedOrigins.length > 0 && allowedOrigins[0] !== '' ? allowedOrigins : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-organization-id'],
  });

  // Global Interceptor and Exception Filter
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  await app.listen(port);
  console.log(`[Lookara Backend] Server listening on http://localhost:${port}`);
}

bootstrap();
