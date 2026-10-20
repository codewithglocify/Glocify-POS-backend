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
    description: '',
  },
  {
    code: 'District Manager',
    description: '',
  },
  {
    code: 'Country Manager',
    description: '',
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
  });
}
