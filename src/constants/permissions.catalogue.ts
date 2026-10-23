import { AssignmentScopeType, AuthSurface } from '../generated/prisma/client.js';

export type PermissionSeed = {
  code: string;
  description: string;
  surfaces: AuthSurface[];
  allowedScopeTypes: AssignmentScopeType[];
};

/** Baseline permission catalogue from documentation Access model. */
export const BASELINE_PERMISSIONS: PermissionSeed[] = [
  {
    code: 'sale.checkout',
    description: 'Complete a sale',
    surfaces: [AuthSurface.POS],
    allowedScopeTypes: [AssignmentScopeType.STORE],
  },
  {
    code: 'sale.discount.manual',
    description: 'Apply a manual discount within role limit',
    surfaces: [AuthSurface.POS],
    allowedScopeTypes: [AssignmentScopeType.STORE],
  },
  {
    code: 'sale.post_void',
    description: 'Post-void a completed sale',
    surfaces: [AuthSurface.POS, AuthSurface.ADMIN],
    allowedScopeTypes: [AssignmentScopeType.STORE],
  },
  {
    code: 'sale.void',
    description: 'Void a draft or in-progress sale',
    surfaces: [AuthSurface.POS],
    allowedScopeTypes: [AssignmentScopeType.STORE],
  },
  {
    code: 'cash.no_sale',
    description: 'Open drawer with no sale',
    surfaces: [AuthSurface.POS],
    allowedScopeTypes: [AssignmentScopeType.STORE],
  },
  {
    code: 'cash.session.open',
    description: 'Open a cash session',
    surfaces: [AuthSurface.POS],
    allowedScopeTypes: [AssignmentScopeType.STORE],
  },
  {
    code: 'cash.session.close',
    description: 'Close a cash session',
    surfaces: [AuthSurface.POS, AuthSurface.ADMIN],
    allowedScopeTypes: [AssignmentScopeType.STORE],
  },
  {
    code: 'cash.day.close',
    description: 'Close the store day',
    surfaces: [AuthSurface.POS, AuthSurface.ADMIN],
    allowedScopeTypes: [AssignmentScopeType.STORE],
  },
  {
    code: 'customer.pii.unmask',
    description: 'Reveal masked customer contact details',
    surfaces: [AuthSurface.POS, AuthSurface.ADMIN],
    allowedScopeTypes: [AssignmentScopeType.STORE, AssignmentScopeType.COUNTRY],
  },
  {
    code: 'report.store.view',
    description: 'View store operational reports',
    surfaces: [AuthSurface.ADMIN],
    allowedScopeTypes: [AssignmentScopeType.STORE],
  },
  {
    code: 'report.export',
    description: 'Export reports',
    surfaces: [AuthSurface.ADMIN],
    allowedScopeTypes: [
      AssignmentScopeType.STORE,
      AssignmentScopeType.COUNTRY,
      AssignmentScopeType.REGION,
      AssignmentScopeType.BRAND,
      AssignmentScopeType.ORGANIZATION,
    ],
  },
  {
    code: 'device.terminal.view',
    description: 'View terminals for a store',
    surfaces: [AuthSurface.ADMIN],
    allowedScopeTypes: [AssignmentScopeType.STORE],
  },
  {
    code: 'device.terminal.manage',
    description: 'Register or suspend terminals',
    surfaces: [AuthSurface.ADMIN],
    allowedScopeTypes: [AssignmentScopeType.STORE, AssignmentScopeType.COUNTRY],
  },
  {
    code: 'config.read',
    description: 'Read configuration',
    surfaces: [AuthSurface.ADMIN],
    allowedScopeTypes: [
      AssignmentScopeType.STORE,
      AssignmentScopeType.COUNTRY,
      AssignmentScopeType.REGION,
      AssignmentScopeType.BRAND,
      AssignmentScopeType.ORGANIZATION,
    ],
  },
  {
    code: 'config.publish',
    description: 'Publish locked or organization configuration',
    surfaces: [AuthSurface.ADMIN],
    allowedScopeTypes: [AssignmentScopeType.ORGANIZATION, AssignmentScopeType.BRAND],
  },
  {
    code: 'role.assign',
    description: 'Assign roles to users',
    surfaces: [AuthSurface.ADMIN],
    allowedScopeTypes: [AssignmentScopeType.ORGANIZATION, AssignmentScopeType.BRAND, AssignmentScopeType.COUNTRY],
  },
  {
    code: 'integration.manage',
    description: 'Enable or configure integrations',
    surfaces: [AuthSurface.ADMIN],
    allowedScopeTypes: [AssignmentScopeType.ORGANIZATION, AssignmentScopeType.BRAND],
  },
  {
    code: 'audit.view',
    description: 'View audit log',
    surfaces: [AuthSurface.ADMIN],
    allowedScopeTypes: [
      AssignmentScopeType.STORE,
      AssignmentScopeType.COUNTRY,
      AssignmentScopeType.REGION,
      AssignmentScopeType.BRAND,
      AssignmentScopeType.ORGANIZATION,
    ],
  },
];

export const STORE_USER_PERMISSION_CODES = [
  'sale.checkout',
  'sale.discount.manual',
  'sale.void',
  'cash.session.open',
  'cash.no_sale',
] as const;

export const STORE_ADMIN_PERMISSION_CODES = [
  ...STORE_USER_PERMISSION_CODES,
  'sale.post_void',
  'cash.session.close',
  'cash.day.close',
  'report.store.view',
  'device.terminal.view',
  'customer.pii.unmask',
] as const;

export const COMPANY_ADMIN_PERMISSION_CODES = [
  'config.publish',
  'integration.manage',
  'role.assign',
  'report.export',
  'audit.view',
  'config.read',
] as const;
