import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PasswordHasher, TokenService } from '@nestjs/authentication';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActiveStatus, AppUserStatus, Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuthorizationService } from '../authorization/authorization.service.js';
import { OrganizationService } from './organization.service.js';
import { SUPER_ADMIN_ROLE_CODE } from '../../constants/roles.constants.js';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let prisma: {
    $transaction: ReturnType<typeof vi.fn>;
    permission: { findMany: ReturnType<typeof vi.fn> };
    organization: { create: ReturnType<typeof vi.fn> };
    role: { create: ReturnType<typeof vi.fn> };
    rolePermission: { createMany: ReturnType<typeof vi.fn> };
    appUser: { create: ReturnType<typeof vi.fn> };
    userAssignment: { create: ReturnType<typeof vi.fn> };
  };
  let passwordHasher: { hash: ReturnType<typeof vi.fn> };
  let tokens: { issue: ReturnType<typeof vi.fn> };
  let authorizationService: { getAuthzForUser: ReturnType<typeof vi.fn> };

  const dto = {
    code: 'acme',
    legalName: 'Acme Retail Ltd',
    email: 'admin@acme.test',
    username: 'acme.admin',
    password: 'Str0ng!Passw0rd',
  };

  const organization = {
    id: 'org-1',
    code: 'acme',
    legalName: 'Acme Retail Ltd',
    status: ActiveStatus.ACTIVE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    createdBy: 'acme.admin',
    updatedBy: 'acme.admin',
  };

  const user = {
    id: 'user-1',
    organizationId: 'org-1',
    email: 'admin@acme.test',
    displayName: 'acme.admin',
    externalSubject: 'acme.admin',
    pinHash: '$scrypt$...',
    pinSetAt: new Date('2026-01-01T00:00:00.000Z'),
    status: AppUserStatus.ACTIVE,
    employeeNumber: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    prisma = {
      $transaction: vi.fn(),
      permission: { findMany: vi.fn() },
      organization: { create: vi.fn() },
      role: { create: vi.fn() },
      rolePermission: { createMany: vi.fn() },
      appUser: { create: vi.fn() },
      userAssignment: { create: vi.fn() },
    };
    passwordHasher = { hash: vi.fn().mockResolvedValue('$scrypt$...') };
    tokens = {
      issue: vi.fn().mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 3600,
      }),
    };
    authorizationService = {
      getAuthzForUser: vi.fn().mockResolvedValue({
        roles: [{ code: SUPER_ADMIN_ROLE_CODE, name: 'Super Admin' }],
        permissions: ['org.manage'],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        { provide: PrismaService, useValue: prisma },
        { provide: PasswordHasher, useValue: passwordHasher },
        { provide: TokenService, useValue: tokens },
        { provide: AuthorizationService, useValue: authorizationService },
      ],
    }).compile();

    service = module.get(OrganizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('onboards an organization with Super Admin and tokens', async () => {
    let capturedExternalSubject: string | undefined;
    prisma.$transaction.mockImplementation(async (fn) => {
      const tx = {
        organization: {
          create: vi.fn().mockResolvedValue(organization),
        },
        role: {
          create: vi.fn().mockResolvedValue({
            id: 'role-1',
            code: SUPER_ADMIN_ROLE_CODE,
          }),
        },
        permission: {
          findMany: vi.fn().mockResolvedValue([{ id: 'perm-1' }]),
        },
        rolePermission: {
          createMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
        appUser: {
          create: vi.fn().mockImplementation(({ data }) => {
            capturedExternalSubject = data.externalSubject;
            return Promise.resolve({
              ...user,
              externalSubject: data.externalSubject,
              employeeNumber: data.employeeNumber ?? null,
            });
          }),
        },
        userAssignment: {
          create: vi.fn().mockResolvedValue({ id: 'assign-1' }),
        },
      };
      return fn(tx);
    });

    const result = await service.create(dto);

    expect(passwordHasher.hash).toHaveBeenCalledWith(dto.password);
    expect(capturedExternalSubject).toMatch(/^org-1:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(tokens.issue).toHaveBeenCalledWith('user-1', {
      method: 'password',
      claims: { organizationId: 'org-1' },
    });
    expect(result.organization.code).toBe('acme');
    expect(result.user).not.toHaveProperty('pinHash');
    expect(result.accessToken).toBe('access');
    expect(result.refreshToken).toBe('refresh');
    expect(authorizationService.getAuthzForUser).toHaveBeenCalledWith('user-1');
    expect(result.roles).toEqual([{ code: SUPER_ADMIN_ROLE_CODE, name: 'Super Admin' }]);
    expect(result.permissions).toEqual(['org.manage']);
  });

  it('uses employeeNumber in externalSubject when provided', async () => {
    let capturedExternalSubject: string | undefined;
    prisma.$transaction.mockImplementation(async (fn) => {
      const tx = {
        organization: {
          create: vi.fn().mockResolvedValue(organization),
        },
        role: {
          create: vi.fn().mockResolvedValue({
            id: 'role-1',
            code: SUPER_ADMIN_ROLE_CODE,
          }),
        },
        permission: {
          findMany: vi.fn().mockResolvedValue([]),
        },
        rolePermission: {
          createMany: vi.fn(),
        },
        appUser: {
          create: vi.fn().mockImplementation(({ data }) => {
            capturedExternalSubject = data.externalSubject;
            return Promise.resolve({
              ...user,
              externalSubject: data.externalSubject,
              employeeNumber: data.employeeNumber,
            });
          }),
        },
        userAssignment: {
          create: vi.fn().mockResolvedValue({ id: 'assign-1' }),
        },
      };
      return fn(tx);
    });

    await service.create({ ...dto, employeeNumber: 'E10001' });

    expect(capturedExternalSubject).toBe('org-1:E10001');
  });

  it('maps duplicate organization code to ConflictException', async () => {
    prisma.$transaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(tokens.issue).not.toHaveBeenCalled();
  });
});
