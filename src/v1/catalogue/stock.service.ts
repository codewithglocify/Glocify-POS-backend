import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  async getForStore(organizationId: string, storeId: string, sku: string) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, organizationId },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const position = await this.prisma.stockPosition.findUnique({
      where: { storeId_sku: { storeId, sku } },
    });
    if (!position) {
      throw new NotFoundException('Stock position not found');
    }

    return {
      storeId: position.storeId,
      sku: position.sku,
      onHand: position.onHand?.toString() ?? null,
      availableToSell: position.availableToSell?.toString() ?? null,
      reserved: position.reserved?.toString() ?? null,
      sourceSystem: position.sourceSystem,
      asOf: position.asOf,
    };
  }

  async upsert(
    organizationId: string,
    data: {
      storeId: string;
      sku: string;
      onHand?: string;
      availableToSell?: string;
      reserved?: string;
      sourceSystem: string;
      asOf?: Date;
    },
  ) {
    const store = await this.prisma.store.findFirst({
      where: { id: data.storeId, organizationId },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const position = await this.prisma.stockPosition.upsert({
      where: { storeId_sku: { storeId: data.storeId, sku: data.sku } },
      create: {
        storeId: data.storeId,
        sku: data.sku,
        onHand: data.onHand,
        availableToSell: data.availableToSell,
        reserved: data.reserved,
        sourceSystem: data.sourceSystem,
        asOf: data.asOf ?? new Date(),
      },
      update: {
        onHand: data.onHand,
        availableToSell: data.availableToSell,
        reserved: data.reserved,
        sourceSystem: data.sourceSystem,
        asOf: data.asOf ?? new Date(),
      },
    });

    return {
      storeId: position.storeId,
      sku: position.sku,
      onHand: position.onHand?.toString() ?? null,
      availableToSell: position.availableToSell?.toString() ?? null,
      reserved: position.reserved?.toString() ?? null,
      sourceSystem: position.sourceSystem,
      asOf: position.asOf,
    };
  }
}
