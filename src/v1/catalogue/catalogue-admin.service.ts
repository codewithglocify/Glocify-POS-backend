import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ActiveStatus, Prisma } from '../../generated/prisma/client.js';
import type { AppUser } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class CatalogueAdminService {
  constructor(private readonly prisma: PrismaService) {}

  createCategory(organizationId: string, data: { code: string; name: string; parentId?: string }) {
    return this.prisma.category
      .create({
        data: {
          organizationId,
          code: data.code,
          name: data.name,
          parentId: data.parentId,
        },
      })
      .catch(this.mapUnique('Category code already exists'));
  }

  listCategories(organizationId: string) {
    return this.prisma.category.findMany({
      where: { organizationId },
      orderBy: { code: 'asc' },
    });
  }

  async createProduct(
    organizationId: string,
    data: {
      sapArticle: string;
      styleNumber?: string;
      name: string;
      taxClassCode: string;
      variants: Array<{ sku: string; color?: string; size?: string }>;
    },
  ) {
    if (!data.variants.length) {
      throw new BadRequestException('At least one variant is required');
    }

    try {
      return await this.prisma.product.create({
        data: {
          organizationId,
          sapArticle: data.sapArticle,
          styleNumber: data.styleNumber,
          name: data.name,
          taxClassCode: data.taxClassCode,
          variants: {
            create: data.variants.map((variant) => ({
              sku: variant.sku,
              color: variant.color,
              size: variant.size,
            })),
          },
        },
        include: { variants: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Product or SKU already exists');
      }
      throw error;
    }
  }

  listProducts(organizationId: string) {
    return this.prisma.product.findMany({
      where: { organizationId },
      include: { variants: true },
      orderBy: { sapArticle: 'asc' },
    });
  }

  async addBarcode(
    organizationId: string,
    data: { variantId: string; symbology: string; value: string; isPrimary?: boolean },
  ) {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: data.variantId, product: { organizationId } },
    });
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    try {
      return await this.prisma.barcode.create({
        data: {
          organizationId,
          variantId: data.variantId,
          symbology: data.symbology,
          value: data.value,
          isPrimary: data.isPrimary ?? false,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Barcode already exists');
      }
      throw error;
    }
  }

  async createPriceList(
    organizationId: string,
    data: {
      code: string;
      currencyCode: string;
      sourceSystem: string;
      brandId?: string;
      countryId?: string;
      concept?: string;
    },
  ) {
    try {
      return await this.prisma.priceList.create({
        data: {
          organizationId,
          code: data.code,
          currencyCode: data.currencyCode,
          sourceSystem: data.sourceSystem,
          brandId: data.brandId,
          countryId: data.countryId,
          concept: data.concept,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Price list code already exists');
      }
      throw error;
    }
  }

  async upsertPriceListItem(
    organizationId: string,
    data: {
      priceListId: string;
      variantId: string;
      unitPrice: string;
      compareAtPrice?: string;
      effectiveFrom: Date;
      effectiveTo?: Date;
      sourceDocument?: string;
    },
  ) {
    if (data.effectiveTo && data.effectiveTo <= data.effectiveFrom) {
      throw new BadRequestException('effectiveTo must be after effectiveFrom');
    }

    const priceList = await this.prisma.priceList.findFirst({
      where: { id: data.priceListId, organizationId },
    });
    if (!priceList) {
      throw new NotFoundException('Price list not found');
    }

    const variant = await this.prisma.productVariant.findFirst({
      where: { id: data.variantId, product: { organizationId } },
    });
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    return this.prisma.priceListItem.create({
      data: {
        priceListId: data.priceListId,
        variantId: data.variantId,
        unitPrice: data.unitPrice,
        compareAtPrice: data.compareAtPrice,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        sourceDocument: data.sourceDocument,
      },
    });
  }

  async assignStorePriceList(
    organizationId: string,
    data: { storeId: string; priceListId: string; priority?: number },
  ) {
    const store = await this.prisma.store.findFirst({
      where: { id: data.storeId, organizationId },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const priceList = await this.prisma.priceList.findFirst({
      where: { id: data.priceListId, organizationId },
    });
    if (!priceList) {
      throw new NotFoundException('Price list not found');
    }

    return this.prisma.storePriceList.upsert({
      where: {
        storeId_priceListId: { storeId: data.storeId, priceListId: data.priceListId },
      },
      create: {
        storeId: data.storeId,
        priceListId: data.priceListId,
        priority: data.priority ?? 100,
      },
      update: {
        priority: data.priority ?? 100,
      },
    });
  }

  async updateProductStatus(organizationId: string, productId: string, status: ActiveStatus) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, organizationId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: { status },
    });
  }

  private mapUnique(message: string) {
    return (error: unknown) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(message);
      }
      throw error;
    };
  }
}
