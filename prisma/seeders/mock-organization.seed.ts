import { PasswordHasher } from '@nestjs/authentication';
import { PrismaClient } from '../../dist/generated/prisma/client.js';

export default async function (prisma: PrismaClient) {
  const orgUuid = crypto.randomUUID();
  const passwordHasher = new PasswordHasher();

  const organization = await prisma.organization.create({
    data: {
      legalName: `Mock Organization - ${orgUuid}`,
      code: orgUuid,
      createdBy: 'Mock Seeder',
      updatedBy: 'Mock Seeder',
    },
  });

  const organizationAdmin = await prisma.appUser.create({
    data: {
      displayName: 'Mock Admin',
      externalSubject: 'Mock Seeder',
      email: 'johndoe@mock.com',
      pinHash: await passwordHasher.hash('mock@123'),
      pinSetAt: new Date(),
      status: 'ACTIVE',
      employeeNumber: 'MOCK0000001',
      organizationId: organization.id,
    },
  });

  console.info(`Generated a mock organization... Admin is ${organizationAdmin.email}`);
}
