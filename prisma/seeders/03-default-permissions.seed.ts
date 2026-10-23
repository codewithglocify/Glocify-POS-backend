import { PrismaClient } from '../../dist/generated/prisma/client.js';

const PERMISSIONS = [
  {
    code: 'sale.checkout',
    description: 'Complete a sale',
    surfaces: ['POS'],
    allowedScopeTypes: ['STORE'],
  },
  {
    code: 'sale.discount.manual',
    description: 'Apply a manual discount within role limit',
    surfaces: ['POS'],
    allowedScopeTypes: ['STORE'],
  },
  {
    code: 'sale.post_void',
    description: 'Post-void a completed sale',
    surfaces: ['POS', 'ADMIN'],
    allowedScopeTypes: ['STORE'],
  },
  {
    code: 'sale.void',
    description: 'Void a draft or in-progress sale',
    surfaces: ['POS'],
    allowedScopeTypes: ['STORE'],
  },
  {
    code: 'cash.no_sale',
    description: 'Open drawer with no sale',
    surfaces: ['POS'],
    allowedScopeTypes: ['STORE'],
  },
  {
    code: 'cash.session.open',
    description: 'Open a cash session',
    surfaces: ['POS'],
    allowedScopeTypes: ['STORE'],
  },
  {
    code: 'cash.session.close',
    description: 'Close a cash session',
    surfaces: ['POS', 'ADMIN'],
    allowedScopeTypes: ['STORE'],
  },
  {
    code: 'cash.day.close',
    description: 'Close the store day',
    surfaces: ['POS', 'ADMIN'],
    allowedScopeTypes: ['STORE'],
  },
  {
    code: 'customer.pii.unmask',
    description: 'Reveal masked customer contact details',
    surfaces: ['POS', 'ADMIN'],
    allowedScopeTypes: ['STORE', 'COUNTRY'],
  },
  {
    code: 'report.store.view',
    description: 'View store operational reports',
    surfaces: ['ADMIN'],
    allowedScopeTypes: ['STORE'],
  },
  {
    code: 'report.export',
    description: 'Export reports',
    surfaces: ['ADMIN'],
    allowedScopeTypes: ['STORE', 'COUNTRY', 'REGION', 'BRAND', 'ORGANIZATION'],
  },
  {
    code: 'device.terminal.view',
    description: 'View terminals for a store',
    surfaces: ['ADMIN'],
    allowedScopeTypes: ['STORE'],
  },
  {
    code: 'device.terminal.manage',
    description: 'Register or suspend terminals',
    surfaces: ['ADMIN'],
    allowedScopeTypes: ['STORE', 'COUNTRY'],
  },
  {
    code: 'config.read',
    description: 'Read configuration',
    surfaces: ['ADMIN'],
    allowedScopeTypes: ['STORE', 'COUNTRY', 'REGION', 'BRAND', 'ORGANIZATION'],
  },
  {
    code: 'config.publish',
    description: 'Publish locked or organization configuration',
    surfaces: ['ADMIN'],
    allowedScopeTypes: ['ORGANIZATION', 'BRAND'],
  },
  {
    code: 'role.assign',
    description: 'Assign roles to users',
    surfaces: ['ADMIN'],
    allowedScopeTypes: ['ORGANIZATION', 'BRAND', 'COUNTRY'],
  },
  {
    code: 'integration.manage',
    description: 'Enable or configure integrations',
    surfaces: ['ADMIN'],
    allowedScopeTypes: ['ORGANIZATION', 'BRAND'],
  },
  {
    code: 'audit.view',
    description: 'View audit log',
    surfaces: ['ADMIN'],
    allowedScopeTypes: ['STORE', 'COUNTRY', 'REGION', 'BRAND', 'ORGANIZATION'],
  },
] as const;

export default async function (prisma: PrismaClient) {
  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      create: {
        code: permission.code,
        description: permission.description,
        surfaces: [...permission.surfaces],
        allowedScopeTypes: [...permission.allowedScopeTypes],
      },
      update: {
        description: permission.description,
        surfaces: [...permission.surfaces],
        allowedScopeTypes: [...permission.allowedScopeTypes],
      },
    });
  }
}
