import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ActiveStatus, Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PriceResolutionService } from './price-resolution.service.js';

export type ProductHit = {
  sku: string;
  name: string;
  unitPrice: string;
  currencyCode: string;
};

const SEARCH_LIMIT = 50;

@Injectable()
export class CatalogueSearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly priceResolution: PriceResolutionService,
  ) {}

  async search(params: {
    organizationId: string;
    storeId: string;
    q?: string;
    barcode?: string;
  }): Promise<ProductHit[]> {
    if (!params.q && !params.barcode) {
      throw new BadRequestException('Provide q or barcode');
    }

    const store = await this.prisma.store.findFirst({
      where: { id: params.storeId, organizationId: params.organizationId },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const variants = params.barcode
      ? await this.findByBarcode(params.organizationId, params.barcode)
      : await this.findByQuery(params.organizationId, params.q!);

    const hits: ProductHit[] = [];
    for (const variant of variants) {
      const price = await this.priceResolution.resolveForStore(store.id, variant.id);
      if (!price) {
        continue;
      }
      hits.push({
        sku: variant.sku,
        name: variant.name,
        unitPrice: price.unitPrice,
        currencyCode: price.currencyCode,
      });
      if (hits.length >= SEARCH_LIMIT) {
        break;
      }
    }

    return hits;
  }

  private async findByBarcode(organizationId: string, barcode: string) {
    const row = await this.prisma.barcode.findFirst({
      where: { organizationId, value: barcode },
      include: {
        variant: {
          include: { product: true },
        },
      },
    });

    if (
      !row ||
      row.variant.status !== ActiveStatus.ACTIVE ||
      row.variant.product.status !== ActiveStatus.ACTIVE ||
      row.variant.product.organizationId !== organizationId
    ) {
      return [];
    }

    return [{ id: row.variant.id, sku: row.variant.sku, name: row.variant.product.name }];
  }

  private async findByQuery(organizationId: string, q: string) {
    const rows = await this.prisma.$queryRaw<Array<{ id: string; sku: string; name: string }>>(Prisma.sql`
      SELECT v.id, v.sku, p.name
      FROM pos.product_variants v
      JOIN pos.products p ON p.id = v.product_id
      LEFT JOIN pos.product_translations t ON t.variant_id = v.id
      WHERE p.organization_id = ${organizationId}::uuid
        AND p.status = 'ACTIVE'
        AND v.status = 'ACTIVE'
        AND (
          v.sku % ${q}
          OR p.name % ${q}
          OR t.name % ${q}
          OR v.sku ILIKE ${'%' + q + '%'}
          OR p.name ILIKE ${'%' + q + '%'}
          OR t.name ILIKE ${'%' + q + '%'}
        )
      ORDER BY GREATEST(
        similarity(v.sku, ${q}),
        similarity(p.name, ${q}),
        COALESCE(similarity(t.name, ${q}), 0)
      ) DESC
      LIMIT ${SEARCH_LIMIT * 2}
    `);

    const seen = new Set<string>();
    const unique: Array<{ id: string; sku: string; name: string }> = [];
    for (const row of rows) {
      if (seen.has(row.id)) {
        continue;
      }
      seen.add(row.id);
      unique.push(row);
    }
    return unique;
  }
}
