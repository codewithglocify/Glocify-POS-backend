import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { StoreService } from './store.service.js';

describe('StoreService', () => {
  let service: StoreService;
  let prisma: {
    brand: { findFirst: ReturnType<typeof vi.fn> };
    organizationCountry: { findUnique: ReturnType<typeof vi.fn> };
    store: { create: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn> };
  };

  const user = {
    organizationId: 'org-1',
    displayName: 'Country Manager',
  } as never;

  beforeEach(async () => {
    prisma = {
      brand: { findFirst: vi.fn() },
      organizationCountry: { findUnique: vi.fn() },
      store: { create: vi.fn(), findMany: vi.fn() },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoreService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(StoreService);
  });

  it('rejects create when brand is outside the org', async () => {
    prisma.brand.findFirst.mockResolvedValue(null);
    await expect(
      service.create(user, {
        brandId: 'brand-1',
        countryId: 'country-1',
        code: 'S1',
        name: 'Store',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('defaults currency and language from country', async () => {
    prisma.brand.findFirst.mockResolvedValue({ id: 'brand-1' });
    prisma.organizationCountry.findUnique.mockResolvedValue({
      country: {
        timezone: 'America/New_York',
        defaultCurrencyCode: 'USD',
        defaultLanguageCode: 'en',
      },
    });
    prisma.store.create.mockResolvedValue({ id: 'store-1', code: 'S1' });

    await service.create(user, {
      brandId: 'brand-1',
      countryId: 'country-1',
      code: 'S1',
      name: 'Store',
    });

    expect(prisma.store.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          timezone: 'America/New_York',
          currencyCode: 'USD',
          languageCode: 'en',
        }),
      }),
    );
  });

  it('maps duplicate store code to ConflictException', async () => {
    prisma.brand.findFirst.mockResolvedValue({ id: 'brand-1' });
    prisma.organizationCountry.findUnique.mockResolvedValue({
      country: {
        timezone: 'UTC',
        defaultCurrencyCode: 'USD',
        defaultLanguageCode: 'en',
      },
    });
    prisma.store.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.create(user, {
        brandId: 'brand-1',
        countryId: 'country-1',
        code: 'S1',
        name: 'Store',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
