import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PriceResolutionService } from './price-resolution.service.js';

describe('PriceResolutionService', () => {
  let service: PriceResolutionService;
  let prisma: { $queryRaw: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = { $queryRaw: vi.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [PriceResolutionService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(PriceResolutionService);
  });

  it('returns null when no price row exists', async () => {
    prisma.$queryRaw.mockResolvedValue([]);
    await expect(service.resolveForStore('store-1', 'variant-1')).resolves.toBeNull();
  });

  it('maps decimal money to fixed strings', async () => {
    prisma.$queryRaw.mockResolvedValue([
      {
        unit_price: new Prisma.Decimal('195.0000'),
        compare_at_price: new Prisma.Decimal('220.0000'),
        currency_code: 'USD',
      },
    ]);

    await expect(service.resolveForStore('store-1', 'variant-1')).resolves.toEqual({
      unitPrice: '195.0000',
      compareAtPrice: '220.0000',
      currencyCode: 'USD',
    });
  });
});
