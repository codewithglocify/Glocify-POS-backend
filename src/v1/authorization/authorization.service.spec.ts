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

  beforeEach(async () => {
    prisma = {
      appUser: {
        findFirst: vi.fn(),
        update: vi.fn(),
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
        accessToken: 'access-2',
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

  it('issues tokens for valid credentials', async () => {
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

  it('strips pinHash from the profile', () => {
    expect(service.toProfile(activeUser)).not.toHaveProperty('pinHash');
    expect(service.toProfile(activeUser).email).toBe('johndoe@mock.com');
  });
});
