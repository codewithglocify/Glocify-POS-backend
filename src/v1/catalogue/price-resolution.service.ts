import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';

export type ResolvedPrice = {
  unitPrice: string;
  compareAtPrice: string | null;
  currencyCode: string;
};

@Injectable()
export class PriceResolutionService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveForStore(storeId: string, variantId: string, asOf: Date = new Date()): Promise<ResolvedPrice | null> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        unit_price: Prisma.Decimal;
        compare_at_price: Prisma.Decimal | null;
        currency_code: string;
      }>
    >(Prisma.sql`
      SELECT i.unit_price, i.compare_at_price, l.currency_code
      FROM pos.store_price_lists sp
      JOIN pos.price_lists l ON l.id = sp.price_list_id
      JOIN pos.price_list_items i ON i.price_list_id = l.id
      WHERE sp.store_id = ${storeId}::uuid
        AND i.variant_id = ${variantId}::uuid
        AND i.effective_from <= ${asOf}
        AND (i.effective_to IS NULL OR i.effective_to > ${asOf})
      ORDER BY sp.priority ASC, i.effective_from DESC
      LIMIT 1
    `);

    const row = rows[0];
    if (!row) {
      return null;
    }

    return {
      unitPrice: row.unit_price.toFixed(4),
      compareAtPrice: row.compare_at_price ? row.compare_at_price.toFixed(4) : null,
      currencyCode: row.currency_code,
    };
  }
}
