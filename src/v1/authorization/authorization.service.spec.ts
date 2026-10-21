import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PasswordHasher, TokenService } from '@nestjs/authentication';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppUserStatus } from '../../generated/prisma/client.js';
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
    pinHash: '$scrypt$ln=17,r=8,p=1$salt$hash',
    status: AppUserStatus.ACTIVE,
    displayName: 'Mock Admin',
    externalSubject: 'Mock Seeder',
    employeeNumber: 'MOCK0000001',
    pinSetAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const authzAssignments = [
    {
      role: {
        code: 'SUPER_ADMIN',
        name: 'Super Admin',
        rolePermissions: [{ permission: { code: 'pos.sale' } }, { permission: { code: 'org.manage' } }],
      },
    },
    {
      role: {
        code: 'SUPER_ADMIN',
        name: 'Super Admin',
        rolePermissions: [{ permission: { code: 'pos.sale' } }],
      },
    },
    {
      role: {
        code: 'CASHIER',
        name: 'Cashier',
        rolePermissions: [{ permission: { code: 'pos.sale' } }],
      },
    },
  ];

  beforeEach(async () => {
    prisma = {
      appUser: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      userAssignment: {
        findMany: vi.fn().mockResolvedValue(authzAssignments),
      },
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
          Buffer.from(JSON.stringify({ sub: 'user-1' })).toString('base64url'),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('issues tokens with roles and permissions for valid credentials', async () => {
    prisma.appUser.findFirst.mockResolvedValue(activeUser);
    passwordHasher.verify.mockResolvedValue(true);

    const result = await service.login({
      organizationId: 'org-1',
      email: 'johndoe@mock.com',
      pin: 'mock@123',
    });

    expect(tokens.issue).toHaveBeenCalledWith('user-1', {
      method: 'pin',
      claims: { organizationId: 'org-1' },
    });
    expect(result).toEqual({
      accessToken: 'access',
      refreshToken: 'refresh',
      expiresIn: 3600,
      roles: [
        { code: 'SUPER_ADMIN', name: 'Super Admin' },
        { code: 'CASHIER', name: 'Cashier' },
      ],
      permissions: ['org.manage', 'pos.sale'],
    });
  });

  it('rejects invalid credentials without revealing the user', async () => {
    prisma.appUser.findFirst.mockResolvedValue(null);
    passwordHasher.verify.mockResolvedValue(false);

    await expect(
      service.login({
        organizationId: 'org-1',
        email: 'missing@mock.com',
        pin: 'wrong',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(passwordHasher.verify).toHaveBeenCalledWith('wrong', undefined);
    expect(tokens.issue).not.toHaveBeenCalled();
  });

  it('refreshes tokens with roles and permissions', async () => {
    const result = await service.refresh('refresh');

    expect(tokens.refresh).toHaveBeenCalledWith('refresh');
    expect(prisma.userAssignment.findMany).toHaveBeenCalled();
    expect(result).toMatchObject({
      refreshToken: 'refresh-2',
      expiresIn: 3600,
      roles: [
        { code: 'SUPER_ADMIN', name: 'Super Admin' },
        { code: 'CASHIER', name: 'Cashier' },
      ],
      permissions: ['org.manage', 'pos.sale'],
    });
  });

  it('returns profile with roles and permissions for me', async () => {
    const result = await service.me(activeUser);

    expect(result).not.toHaveProperty('pinHash');
    expect(result.email).toBe('johndoe@mock.com');
    expect(result.roles).toEqual([
      { code: 'SUPER_ADMIN', name: 'Super Admin' },
      { code: 'CASHIER', name: 'Cashier' },
    ]);
    expect(result.permissions).toEqual(['org.manage', 'pos.sale']);
  });

  it('dedupes roles and sorts unique permission codes', async () => {
    const authz = await service.getAuthzForUser('user-1');

    expect(authz.roles).toEqual([
      { code: 'SUPER_ADMIN', name: 'Super Admin' },
      { code: 'CASHIER', name: 'Cashier' },
    ]);
    expect(authz.permissions).toEqual(['org.manage', 'pos.sale']);
  });

  it('strips pinHash from the profile', () => {
    expect(service.toProfile(activeUser)).not.toHaveProperty('pinHash');
    expect(service.toProfile(activeUser).email).toBe('johndoe@mock.com');
  });
});
