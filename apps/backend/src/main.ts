import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/transform.interceptor';
import { GlobalHttpExceptionFilter } from './common/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  // Swagger OpenAPI Setup
  const config = new DocumentBuilder()
    .setTitle('Lookara API')
    .setDescription('Lookara Canonical API for PM, Owner, Vendor, and Trust Portals.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  await app.listen(port);
  console.log(`[Lookara Backend] Server listening on http://localhost:${port}`);
}

bootstrap();
