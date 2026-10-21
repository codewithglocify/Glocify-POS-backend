import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/app.module.js';
import { createOpenApiDocument } from '../dist/swagger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'postman');
const outFile = join(outDir, 'openapi.json');

const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
const document = createOpenApiDocument(app);

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, `${JSON.stringify(document, null, 2)}\n`);
await app.close();

console.log(`Wrote ${outFile}`);
