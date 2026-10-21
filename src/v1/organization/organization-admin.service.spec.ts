import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { OrganizationAdminService } from './organization-admin.service.js';

describe('OrganizationAdminService', () => {
  let service: OrganizationAdminService;
  let prisma: {
    region: { findUnique: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn> };
    country: { findUnique: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn> };
    organizationRegion: {
      create: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
    organizationCountry: {
      create: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
    };
    brand: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  const user = {
    id: 'user-1',
    organizationId: 'org-1',
    displayName: 'Mock Admin',
  } as never;

  beforeEach(async () => {
    prisma = {
      region: { findUnique: vi.fn(), findMany: vi.fn() },
      country: { findUnique: vi.fn(), findMany: vi.fn() },
      organizationRegion: {
        create: vi.fn(),
        delete: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      organizationCountry: {
        create: vi.fn(),
        delete: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      brand: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganizationAdminService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(OrganizationAdminService);
  });

  it('attaches a region', async () => {
    prisma.region.findUnique.mockResolvedValue({ id: 'region-1', code: 'NAM' });
    prisma.organizationRegion.create.mockResolvedValue({});

    await expect(service.attachRegion('org-1', { regionId: 'region-1' })).resolves.toMatchObject({
      code: 'NAM',
    });
  });

  it('rejects country attach when region is missing on org', async () => {
    prisma.country.findUnique.mockResolvedValue({ id: 'country-1', regionId: 'region-1' });
    prisma.organizationRegion.findUnique.mockResolvedValue(null);

    await expect(service.attachCountry('org-1', { countryId: 'country-1' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('maps duplicate brand code to ConflictException', async () => {
    prisma.brand.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(service.createBrand(user, { code: 'FS', name: 'Fashion' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns NotFound when brand missing', async () => {
    prisma.brand.findFirst.mockResolvedValue(null);
    await expect(service.getBrand('org-1', 'brand-1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
