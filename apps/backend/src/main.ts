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

  try {
    const fs = await import('fs');
    const path = await import('path');
    const outPath = path.resolve(__dirname, '../../../Milestone_1_and_2_Delivery_Package/openapi_spec.json');
    fs.writeFileSync(outPath, JSON.stringify(document, null, 2), 'utf-8');
    fs.writeFileSync(path.resolve(__dirname, '../swagger.json'), JSON.stringify(document, null, 2), 'utf-8');
    console.log('[Lookara Backend] Exported OpenAPI specification to', outPath);
  } catch (e) {
    console.error('Failed to export OpenAPI spec:', e);
  }

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  await app.listen(port);
  console.log(`[Lookara Backend] Server listening on http://localhost:${port}`);
}

bootstrap();
