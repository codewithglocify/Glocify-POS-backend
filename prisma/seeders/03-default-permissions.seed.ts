import { PrismaClient } from '../../dist/generated/prisma/client.js';

const PERMISSIONS = [
  {
    code: 'Associate',
    description: '',
  },
  {
    code: 'Senior Associate',
    description: '',
  },
  {
    code: 'Store Manager',
    description: 'Manages store catalogues, pricing assignments, and stock cache for stores in scope.',
  },
  {
    code: 'District Manager',
    description: '',
  },
  {
    code: 'Country Manager',
    description: 'Manages which stores are added to a country and store master data for that country.',
  },
  {
    code: 'Finance',
    description: '',
  },
  {
    code: 'Loss Prevention',
    description: '',
  },
  {
    code: 'Tax / Fiscal Admin',
    description: '',
  },
  {
    code: 'HQ Admin',
    description: '',
  },
  {
    code: 'Support (vendor)',
    description: '',
  },
];

export default async function (prisma: PrismaClient) {
  await prisma.permission.createMany({
    data: PERMISSIONS,
    skipDuplicates: true,
  });

  for (const permission of PERMISSIONS) {
    if (!permission.description) {
      continue;
    }
    await prisma.permission.updateMany({
      where: { code: permission.code },
      data: { description: permission.description },
    });
  }
}
