import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import ngrok from '@ngrok/ngrok';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

async function devForwardApp() {
  if (process.env.NODE_ENV === 'development' && process.env.NGROK_AUTHTOKEN) {
    try {
      const forwarder = await ngrok.forward({
        addr: `http://localhost:${process.env.PORT ?? 3000}`,
        authtoken_from_env: true,
        domain: process.env.NGROK_FORWARD_DOMAIN,
      });

      console.log(`Application forwarded at: ${forwarder.url()}\n`);
    } catch (e) {
      console.error(e);
    }
  }
}

await devForwardApp();
await bootstrap();
