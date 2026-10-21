import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import type { AppUser, Store } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { CreateStoreDto } from './dto/create-store.dto.js';
import type { UpdateStoreDto } from './dto/update-store.dto.js';

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AppUser, dto: CreateStoreDto): Promise<Store> {
    const brand = await this.prisma.brand.findFirst({
      where: { id: dto.brandId, organizationId: user.organizationId },
    });
    if (!brand) {
      throw new BadRequestException('Brand not found in organization');
    }

    const orgCountry = await this.prisma.organizationCountry.findUnique({
      where: {
        organizationId_countryId: {
          organizationId: user.organizationId,
          countryId: dto.countryId,
        },
      },
      include: { country: true },
    });
    if (!orgCountry) {
      throw new BadRequestException('Country is not attached to the organization');
    }

    const country = orgCountry.country;

    try {
      return await this.prisma.store.create({
        data: {
          organizationId: user.organizationId,
          brandId: dto.brandId,
          countryId: dto.countryId,
          code: dto.code,
          name: dto.name,
          concept: dto.concept,
          timezone: dto.timezone ?? country.timezone,
          currencyCode: dto.currencyCode ?? country.defaultCurrencyCode,
          languageCode: dto.languageCode ?? country.defaultLanguageCode,
          taxJurisdictionCode: dto.taxJurisdictionCode,
          addressLine1: dto.addressLine1,
          city: dto.city,
          postalCode: dto.postalCode,
          createdBy: user.displayName,
          updatedBy: user.displayName,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Store code already exists');
      }
      throw error;
    }
  }

  list(organizationId: string, countryId?: string) {
    return this.prisma.store.findMany({
      where: {
        organizationId,
        ...(countryId ? { countryId } : {}),
      },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(organizationId: string, storeId: string): Promise<Store> {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, organizationId },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    return store;
  }

  async update(user: AppUser, storeId: string, dto: UpdateStoreDto): Promise<Store> {
    await this.findOne(user.organizationId, storeId);

    return this.prisma.store.update({
      where: { id: storeId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.concept !== undefined ? { concept: dto.concept } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
        ...(dto.taxJurisdictionCode !== undefined ? { taxJurisdictionCode: dto.taxJurisdictionCode } : {}),
        ...(dto.addressLine1 !== undefined ? { addressLine1: dto.addressLine1 } : {}),
        ...(dto.city !== undefined ? { city: dto.city } : {}),
        ...(dto.postalCode !== undefined ? { postalCode: dto.postalCode } : {}),
        updatedBy: user.displayName,
      },
    });
  }
}
