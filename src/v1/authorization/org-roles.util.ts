import { AssignmentScopeType, type Prisma, type PrismaClient } from '../../generated/prisma/client.js';
import {
  COMPANY_ADMIN_PERMISSION_CODES,
  STORE_ADMIN_PERMISSION_CODES,
  STORE_USER_PERMISSION_CODES,
} from '../../constants/permissions.catalogue.js';
import {
  COMPANY_ADMIN_ROLE_CODE,
  COMPANY_ADMIN_ROLE_NAME,
  STORE_ADMIN_ROLE_CODE,
  STORE_ADMIN_ROLE_NAME,
  STORE_USER_ROLE_CODE,
  STORE_USER_ROLE_NAME,
} from '../../constants/roles.constants.js';

type Tx = Prisma.TransactionClient | PrismaClient;

const ROLE_TEMPLATES = [
  {
    code: COMPANY_ADMIN_ROLE_CODE,
    name: COMPANY_ADMIN_ROLE_NAME,
    description: 'Company-wide admin console access',
    allowedAssignmentScopes: [AssignmentScopeType.ORGANIZATION, AssignmentScopeType.BRAND],
    permissionCodes: [...COMPANY_ADMIN_PERMISSION_CODES],
  },
  {
    code: STORE_ADMIN_ROLE_CODE,
    name: STORE_ADMIN_ROLE_NAME,
    description: 'Store-scoped admin',
    allowedAssignmentScopes: [AssignmentScopeType.STORE],
    permissionCodes: [...STORE_ADMIN_PERMISSION_CODES],
  },
  {
    code: STORE_USER_ROLE_CODE,
    name: STORE_USER_ROLE_NAME,
    description: 'Store-scoped associate',
    allowedAssignmentScopes: [AssignmentScopeType.STORE],
    permissionCodes: [...STORE_USER_PERMISSION_CODES],
  },
] as const;

/** Ensure shipping role templates exist for an organization with doc permission sets. */
export async function ensureOrganizationRoleTemplates(tx: Tx, organizationId: string) {
  const roles = [];
  for (const template of ROLE_TEMPLATES) {
    const role = await tx.role.upsert({
      where: {
        organizationId_code: { organizationId, code: template.code },
      },
      create: {
        organizationId,
        code: template.code,
        name: template.name,
        description: template.description,
        allowedAssignmentScopes: [...template.allowedAssignmentScopes],
      },
      update: {
        name: template.name,
        description: template.description,
        allowedAssignmentScopes: [...template.allowedAssignmentScopes],
      },
    });

    for (const permissionCode of template.permissionCodes) {
      await tx.rolePermission.upsert({
        where: {
          roleId_permissionCode: { roleId: role.id, permissionCode },
        },
        create: { roleId: role.id, permissionCode },
        update: {},
      });
    }
    roles.push(role);
  }
  return roles;
}
