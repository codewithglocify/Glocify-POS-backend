import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import ngrok from '@ngrok/ngrok';
import { parseArgs } from 'util';
import { AppModule } from './app.module.js';
import { createOpenApiDocument } from './swagger.js';

const options = parseArgs({
  options: {
    noNgrok: { type: 'boolean', default: false },
  },
});

function corsOptions() {
  const credentials = true;

  if (process.env.NODE_ENV !== 'production') {
    return { origin: true, credentials };
  }

  const origins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error('CORS_ORIGINS must be a non-empty comma-separated list when NODE_ENV=production');
  }

  return { origin: origins, credentials };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(corsOptions());
  app.enableShutdownHooks();

  const document = createOpenApiDocument(app);

  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

async function devForwardApp() {
  if (options.values.noNgrok || process.env.NODE_ENV !== 'development' || !process.env.NGROK_AUTHTOKEN) {
    return;
  }

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

await Promise.all([devForwardApp(), bootstrap()]);
