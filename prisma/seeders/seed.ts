import 'dotenv/config';

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import { parseArgs } from 'node:util';

import { PrismaClient } from '../../dist/generated/prisma/client.js';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { readdirSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pgPool = new Pool({
  connectionString: `${process.env.DATABASE_URL}`,
});

const pgPrisma = new PrismaPg(pgPool);
const prisma = new PrismaClient({ adapter: pgPrisma });

async function seed() {
  const args = parseArgs({
    options: {
      seeder: { type: 'string', multiple: true, short: 's' },
    },
  });

  const sargs = args.values.seeder;
  const seeders: string[] = [];

  if (sargs?.length) {
    seeders.push(...sargs.map((s) => `${s}.seed.ts`));
  } else {
    seeders.push(
      ...readdirSync(__dirname).filter((s) => s.endsWith('.seed.ts') && !s.startsWith('.') && !s.includes('mock')),
    );
  }

  for (const seeder of seeders) {
    console.info(`Fetching seeder: ${seeder}`);

    const smodule = await import(`./${seeder}`);

    if (!smodule.default) {
      console.warn(`Seeder "${seeder}" does not export a default seeder function. Will skip...`);
      continue;
    }

    console.info(`Running "${seeder}"...`);
    await smodule.default(prisma);
  }
}

seed()
  .catch((err) => {
    console.error('Failed seeding database...');
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
