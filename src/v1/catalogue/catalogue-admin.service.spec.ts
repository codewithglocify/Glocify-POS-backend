import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CatalogueAdminService } from './catalogue-admin.service.js';

describe('CatalogueAdminService price lists', () => {
  let service: CatalogueAdminService;
  let prisma: {
    priceList: { findMany: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
    priceListItem: { findMany: ReturnType<typeof vi.fn> };
  };

  beforeEach(async () => {
    prisma = {
      priceList: { findMany: vi.fn(), create: vi.fn() },
      priceListItem: { findMany: vi.fn() },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatalogueAdminService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(CatalogueAdminService);
  });

  it('lists price lists for the organization and trims char codes', async () => {
    prisma.priceList.findMany.mockResolvedValue([
      {
        id: 'list-1',
        code: 'IN-FP-INR',
        currencyCode: 'INR ',
        country: { id: 'country-1', isoCode: 'IN ', name: 'India', regionId: 'region-1' },
        brand: { id: 'brand-1', code: 'MOCK', name: 'Mock Brand' },
        storePriceLists: [{ storeId: 'store-1', priority: 100 }],
      },
      {
        id: 'list-2',
        code: 'GLOBAL',
        currencyCode: 'USD',
        country: null,
        brand: null,
        storePriceLists: [],
      },
    ]);

    await expect(service.listPriceLists('org-1')).resolves.toEqual([
      {
        id: 'list-1',
        code: 'IN-FP-INR',
        currencyCode: 'INR',
        country: { id: 'country-1', isoCode: 'IN', name: 'India', regionId: 'region-1' },
        brand: { id: 'brand-1', code: 'MOCK', name: 'Mock Brand' },
        storePriceLists: [{ storeId: 'store-1', priority: 100 }],
      },
      {
        id: 'list-2',
        code: 'GLOBAL',
        currencyCode: 'USD',
        country: null,
        brand: null,
        storePriceLists: [],
      },
    ]);
    expect(prisma.priceList.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId: 'org-1' },
        orderBy: { code: 'asc' },
        include: expect.objectContaining({
          storePriceLists: { select: { storeId: true, priority: true } },
        }),
      }),
    );
  });

  it('lists price items as fixed amounts and ISO dates', async () => {
    const effectiveFrom = new Date('2020-01-01T00:00:00.000Z');
    const effectiveTo = new Date('2025-01-01T00:00:00.000Z');
    prisma.priceListItem.findMany.mockResolvedValue([
      {
        id: 'item-1',
        priceListId: 'list-1',
        variantId: 'variant-1',
        unitPrice: new Prisma.Decimal('999.5'),
        compareAtPrice: new Prisma.Decimal('1299'),
        effectiveFrom,
        effectiveTo,
        priceList: {
          id: 'list-1',
          code: 'IN-FP-INR',
          currencyCode: 'INR ',
          concept: 'FULL_PRICE',
          brandId: 'brand-1',
          countryId: 'country-1',
          country: {
            id: 'country-1',
            isoCode: 'IN ',
            name: 'India',
            regionId: 'region-1',
            priceTaxMode: 'EXCLUSIVE',
          },
          brand: { id: 'brand-1', code: 'MOCK', name: 'Mock Brand' },
        },
        variant: {
          id: 'variant-1',
          sku: 'MOCK-TEE-001',
          product: { id: 'product-1', sapArticle: 'MOCK-TEE', name: 'Mock Tee' },
        },
      },
      {
        id: 'item-2',
        priceListId: 'list-2',
        variantId: 'variant-2',
        unitPrice: new Prisma.Decimal('10'),
        compareAtPrice: null,
        effectiveFrom,
        effectiveTo: null,
        priceList: {
          id: 'list-2',
          code: 'GLOBAL',
          currencyCode: 'USD',
          concept: null,
          brandId: null,
          countryId: null,
          country: null,
          brand: null,
        },
        variant: {
          id: 'variant-2',
          sku: 'SKU-2',
          product: { id: 'product-2', sapArticle: 'ART-2', name: 'Cap' },
        },
      },
    ]);

    await expect(service.listPriceListItems('org-1')).resolves.toEqual([
      {
        id: 'item-1',
        priceListId: 'list-1',
        variantId: 'variant-1',
        unitPrice: '999.5000',
        compareAtPrice: '1299.0000',
        effectiveFrom: '2020-01-01T00:00:00.000Z',
        effectiveTo: '2025-01-01T00:00:00.000Z',
        priceList: {
          id: 'list-1',
          code: 'IN-FP-INR',
          currencyCode: 'INR',
          concept: 'FULL_PRICE',
          brandId: 'brand-1',
          countryId: 'country-1',
          country: {
            id: 'country-1',
            isoCode: 'IN',
            name: 'India',
            regionId: 'region-1',
            priceTaxMode: 'EXCLUSIVE',
          },
          brand: { id: 'brand-1', code: 'MOCK', name: 'Mock Brand' },
        },
        variant: {
          id: 'variant-1',
          sku: 'MOCK-TEE-001',
          product: { id: 'product-1', sapArticle: 'MOCK-TEE', name: 'Mock Tee' },
        },
      },
      {
        id: 'item-2',
        priceListId: 'list-2',
        variantId: 'variant-2',
        unitPrice: '10.0000',
        compareAtPrice: null,
        effectiveFrom: '2020-01-01T00:00:00.000Z',
        effectiveTo: null,
        priceList: {
          id: 'list-2',
          code: 'GLOBAL',
          currencyCode: 'USD',
          concept: null,
          brandId: null,
          countryId: null,
          country: null,
          brand: null,
        },
        variant: {
          id: 'variant-2',
          sku: 'SKU-2',
          product: { id: 'product-2', sapArticle: 'ART-2', name: 'Cap' },
        },
      },
    ]);
    expect(prisma.priceListItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { priceList: { organizationId: 'org-1' } },
        orderBy: { effectiveFrom: 'asc' },
      }),
    );
  });

  it('creates a price list for the caller organization', async () => {
    prisma.priceList.create.mockResolvedValue({ id: 'list-1', code: 'IN-FP-INR' });

    await expect(
      service.createPriceList('org-1', {
        code: 'IN-FP-INR',
        currencyCode: 'INR',
        sourceSystem: 'POS',
        brandId: 'brand-1',
        countryId: 'country-1',
        concept: 'FULL_PRICE',
      }),
    ).resolves.toEqual({ id: 'list-1', code: 'IN-FP-INR' });
    expect(prisma.priceList.create).toHaveBeenCalledWith({
      data: {
        organizationId: 'org-1',
        code: 'IN-FP-INR',
        currencyCode: 'INR',
        sourceSystem: 'POS',
        brandId: 'brand-1',
        countryId: 'country-1',
        concept: 'FULL_PRICE',
      },
    });
  });

  it('maps a duplicate price list code to a conflict', async () => {
    prisma.priceList.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique', { code: 'P2002', clientVersion: 'test' }),
    );

    await expect(
      service.createPriceList('org-1', { code: 'IN-FP-INR', currencyCode: 'INR', sourceSystem: 'POS' }),
    ).rejects.toThrow(new ConflictException('Price list code already exists'));
  });

  it('rethrows an unexpected create error', async () => {
    const error = new Error('db down');
    prisma.priceList.create.mockRejectedValue(error);

    await expect(
      service.createPriceList('org-1', { code: 'IN-FP-INR', currencyCode: 'INR', sourceSystem: 'POS' }),
    ).rejects.toBe(error);
  });
});
