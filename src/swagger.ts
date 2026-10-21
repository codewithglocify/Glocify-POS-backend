import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';

/** Builds the OpenAPI document for export scripts (and for setup in main). */
export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Core POS API')
    .setDescription('OpenAPI documentation for the Core POS backend')
    .setVersion('0.0.1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token from POST /v1/authorization/login',
      },
      'bearer',
    )
    .addTag('Health')
    .addTag('Authorization')
    .addTag('Organization')
    .build();

  return SwaggerModule.createDocument(app, config);
}
