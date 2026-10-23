import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PasswordHasher, TokenService } from '@nestjs/authentication';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppUserStatus, AssignmentScopeType, AuthSurface, StoreStatus } from '../../generated/prisma/client.js';
import {
  COMPANY_ADMIN_ROLE_CODE,
  COMPANY_ADMIN_ROLE_NAME,
  STORE_ADMIN_ROLE_CODE,
  STORE_ADMIN_ROLE_NAME,
} from '../../constants/roles.constants.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuthorizationService } from './authorization.service.js';

describe('AuthorizationService', () => {
  let service: AuthorizationService;
  let prisma: {
    appUser: {
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    userAssignment: {
      findMany: ReturnType<typeof vi.fn>;
    };
    store: {
      findFirst: ReturnType<typeof vi.fn>;
    };
  };
  let passwordHasher: {
    verify: ReturnType<typeof vi.fn>;
    needsRehash: ReturnType<typeof vi.fn>;
    hash: ReturnType<typeof vi.fn>;
  };
  let tokens: {
    issue: ReturnType<typeof vi.fn>;
    refresh: ReturnType<typeof vi.fn>;
    revoke: ReturnType<typeof vi.fn>;
  };

  const activeUser = {
    id: 'user-1',
    organizationId: 'org-1',
    email: 'johndoe@mock.com',
    passwordHash: '$scrypt$password',
    pinHash: null,
    pinSetAt: null,
    status: AppUserStatus.ACTIVE,
    displayName: 'Mock Admin',
    externalSubject: 'Mock Seeder',
    employeeNumber: 'MOCK0000001',
    pinLength: null,
    inviteExpiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const storeAdminUser = {
    ...activeUser,
    id: 'user-2',
    email: 'store.admin@mock.com',
    pinHash: '$scrypt$pin',
    pinSetAt: new Date(),
    pinLength: 4,
  };

  const companyAdminAssignment = {
    id: 'assign-1',
    scopeType: AssignmentScopeType.ORGANIZATION,
    scopeId: 'org-1',
    role: {
      code: COMPANY_ADMIN_ROLE_CODE,
      name: COMPANY_ADMIN_ROLE_NAME,
      allowedAssignmentScopes: [AssignmentScopeType.ORGANIZATION],
      rolePermissions: [
        {
          permission: {
            code: 'config.publish',
            surfaces: [AuthSurface.ADMIN],
            allowedScopeTypes: [AssignmentScopeType.ORGANIZATION],
          },
        },
      ],
    },
  };

  const storeAdminAssignment = {
    id: 'assign-2',
    scopeType: AssignmentScopeType.STORE,
    scopeId: 'store-1',
    role: {
      code: STORE_ADMIN_ROLE_CODE,
      name: STORE_ADMIN_ROLE_NAME,
      allowedAssignmentScopes: [AssignmentScopeType.STORE],
      rolePermissions: [
        {
          permission: {
            code: 'sale.checkout',
            surfaces: [AuthSurface.POS],
            allowedScopeTypes: [AssignmentScopeType.STORE],
          },
        },
        {
          permission: {
            code: 'report.store.view',
            surfaces: [AuthSurface.ADMIN],
            allowedScopeTypes: [AssignmentScopeType.STORE],
          },
        },
      ],
    },
  };

  const liveStore = {
    id: 'store-1',
    organizationId: 'org-1',
    code: 'IN-BOM-01',
    status: StoreStatus.LIVE,
  };

  beforeEach(async () => {
    prisma = {
      appUser: { findFirst: vi.fn(), update: vi.fn() },
      userAssignment: { findMany: vi.fn().mockResolvedValue([companyAdminAssignment]) },
      store: { findFirst: vi.fn() },
    };
    passwordHasher = {
      verify: vi.fn(),
      needsRehash: vi.fn().mockReturnValue(false),
      hash: vi.fn(),
    };
    tokens = {
      issue: vi.fn().mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 3600,
      }),
      refresh: vi.fn().mockResolvedValue({
        accessToken: [
          Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64url'),
          Buffer.from(JSON.stringify({ sub: 'user-2', storeId: 'store-1' })).toString('base64url'),
          'sig',
        ].join('.'),
        refreshToken: 'refresh-2',
        expiresIn: 3600,
      }),
      revoke: vi.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationService,
        { provide: PrismaService, useValue: prisma },
        { provide: PasswordHasher, useValue: passwordHasher },
        { provide: TokenService, useValue: tokens },
      ],
    }).compile();

    service = module.get(AuthorizationService);
  });

  it('admin login issues tokens for Company Admin', async () => {
    prisma.appUser.findFirst.mockResolvedValue(activeUser);
    passwordHasher.verify.mockResolvedValue(true);
    prisma.userAssignment.findMany.mockResolvedValue([companyAdminAssignment]);

    const result = await service.adminLogin({
      organizationId: 'org-1',
      email: 'johndoe@mock.com',
      password: 'mock@123',
    });

    expect(tokens.issue).toHaveBeenCalledWith('user-1', {
      method: 'password',
      claims: { organizationId: 'org-1' },
    });
    expect(result.roles).toEqual([{ code: COMPANY_ADMIN_ROLE_CODE, name: COMPANY_ADMIN_ROLE_NAME }]);
    expect(result.permissions).toEqual(['config.publish']);
  });

  it('rejects admin login without Company Admin assignment', async () => {
    prisma.appUser.findFirst.mockResolvedValue(storeAdminUser);
    passwordHasher.verify.mockResolvedValue(true);
    prisma.userAssignment.findMany.mockResolvedValue([]);

    await expect(
      service.adminLogin({
        organizationId: 'org-1',
        email: 'store.admin@mock.com',
        password: 'mock@123',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects invalid password credentials', async () => {
    prisma.appUser.findFirst.mockResolvedValue(null);
    passwordHasher.verify.mockResolvedValue(false);

    await expect(
      service.adminLogin({
        organizationId: 'org-1',
        email: 'missing@mock.com',
        password: 'wrong',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('pos password login returns pinSet flag', async () => {
    prisma.appUser.findFirst.mockResolvedValue(storeAdminUser);
    passwordHasher.verify.mockResolvedValue(true);
    prisma.userAssignment.findMany.mockResolvedValue([storeAdminAssignment]);

    const result = await service.posPasswordLogin({
      organizationId: 'org-1',
      email: 'store.admin@mock.com',
      password: 'mock@123',
    });

    expect(result.pinSet).toBe(true);
    expect(result.userId).toBe('user-2');
  });

  it('pos pin login returns store and preserves storeId claim family', async () => {
    prisma.appUser.findFirst.mockResolvedValue(storeAdminUser);
    passwordHasher.verify.mockResolvedValue(true);
    prisma.userAssignment.findMany.mockResolvedValue([storeAdminAssignment]);
    prisma.store.findFirst.mockResolvedValue(liveStore);

    const result = await service.posPinLogin({
      organizationId: 'org-1',
      userId: 'user-2',
      pin: '1234',
    });

    expect(tokens.issue).toHaveBeenCalledWith('user-2', {
      method: 'pin',
      claims: { organizationId: 'org-1', storeId: 'store-1' },
    });
    expect(result.store).toEqual(liveStore);

    const refreshed = await service.refresh('refresh');
    const payload = JSON.parse(Buffer.from(refreshed.accessToken.split('.')[1]!, 'base64url').toString('utf8')) as {
      storeId?: string;
    };
    expect(payload.storeId).toBe('store-1');
  });

  it('filters permissions by surface for getAuthzForUser', async () => {
    prisma.userAssignment.findMany.mockResolvedValue([storeAdminAssignment]);

    const posAuthz = await service.getAuthzForUser('user-2', AuthSurface.POS);
    expect(posAuthz.permissions).toEqual(['sale.checkout']);

    const adminAuthz = await service.getAuthzForUser('user-2', AuthSurface.ADMIN);
    expect(adminAuthz.permissions).toEqual(['report.store.view']);
  });

  it('strips password and pin hashes from profile', () => {
    const profile = service.toProfile(storeAdminUser as never);
    expect(profile).not.toHaveProperty('passwordHash');
    expect(profile).not.toHaveProperty('pinHash');
  });
});
