import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PasswordHasher, TokenService } from '@nestjs/authentication';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActiveStatus, AppUserStatus, Prisma } from '../../generated/prisma/client.js';
import { COMPANY_ADMIN_ROLE_CODE } from '../../constants/roles.constants.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuthorizationService } from '../authorization/authorization.service.js';
import { OrganizationAdminService } from './organization-admin.service.js';
import { OrganizationService } from './organization.service.js';

vi.mock('../authorization/org-roles.util.js', () => ({
  ensureOrganizationRoleTemplates: vi.fn().mockResolvedValue([]),
}));

describe('OrganizationService', () => {
  let service: OrganizationService;
  let prisma: { $transaction: ReturnType<typeof vi.fn> };
  let passwordHasher: { hash: ReturnType<typeof vi.fn> };
  let tokens: { issue: ReturnType<typeof vi.fn> };
  let authorizationService: {
    getAuthzForUser: ReturnType<typeof vi.fn>;
    toProfile: ReturnType<typeof vi.fn>;
  };
  let organizationAdminService: {
    ensureRegions: ReturnType<typeof vi.fn>;
    ensureCountries: ReturnType<typeof vi.fn>;
  };

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
    passwordHash: '$scrypt$...',
    pinHash: null,
    pinSetAt: null,
    status: AppUserStatus.ACTIVE,
    employeeNumber: null,
    pinLength: null,
    inviteExpiresAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  function txStub(overrides: Record<string, unknown> = {}) {
    return {
      organization: { create: vi.fn().mockResolvedValue(organization) },
      role: {
        findUniqueOrThrow: vi.fn().mockResolvedValue({
          id: 'role-1',
          code: COMPANY_ADMIN_ROLE_CODE,
        }),
      },
      appUser: {
        create: vi.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            ...user,
            externalSubject: data.externalSubject,
            employeeNumber: data.employeeNumber ?? null,
            passwordHash: data.passwordHash,
          }),
        ),
      },
      userAssignment: { create: vi.fn().mockResolvedValue({ id: 'assign-1' }) },
      region: { findMany: vi.fn().mockResolvedValue([]) },
      ...overrides,
    };
  }

  beforeEach(async () => {
    prisma = { $transaction: vi.fn() };
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
        roles: [{ code: COMPANY_ADMIN_ROLE_CODE, name: 'Company Admin' }],
        permissions: ['config.publish'],
      }),
      toProfile: vi.fn().mockImplementation((u) => {
        const { passwordHash: _p, pinHash: _pin, ...profile } = u;
        return profile;
      }),
    };
    organizationAdminService = {
      ensureRegions: vi.fn().mockResolvedValue([]),
      ensureCountries: vi.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        { provide: PrismaService, useValue: prisma },
        { provide: PasswordHasher, useValue: passwordHasher },
        { provide: TokenService, useValue: tokens },
        { provide: AuthorizationService, useValue: authorizationService },
        { provide: OrganizationAdminService, useValue: organizationAdminService },
      ],
    }).compile();

    service = module.get(OrganizationService);
  });

  it('onboards an organization with Company Admin and tokens', async () => {
    prisma.$transaction.mockImplementation(async (fn) => fn(txStub()));

    const result = await service.create(dto);

    expect(passwordHasher.hash).toHaveBeenCalledWith(dto.password);
    expect(tokens.issue).toHaveBeenCalledWith('user-1', {
      method: 'password',
      claims: { organizationId: 'org-1' },
    });
    expect(result.organization.code).toBe('acme');
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result.roles).toEqual([{ code: COMPANY_ADMIN_ROLE_CODE, name: 'Company Admin' }]);
  });

  it('attaches countries when countryIds are provided', async () => {
    const country = { id: 'country-1', regionId: 'region-1', isoCode: 'US' };
    const region = { id: 'region-1', code: 'NAM' };
    organizationAdminService.ensureCountries.mockResolvedValue([country]);

    prisma.$transaction.mockImplementation(async (fn) =>
      fn(
        txStub({
          region: { findMany: vi.fn().mockResolvedValue([region]) },
        }),
      ),
    );

    const result = await service.create({ ...dto, countryIds: ['country-1'] });
    expect(result.countries).toEqual([country]);
    expect(result.regions).toEqual([region]);
  });

  it('maps unique constraint to ConflictException', async () => {
    prisma.$transaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
  });
});
