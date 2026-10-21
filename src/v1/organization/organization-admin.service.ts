import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import type { AppUser, Brand } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { AttachCountryDto } from './dto/attach-country.dto.js';
import type { AttachRegionDto } from './dto/attach-region.dto.js';
import type { CreateBrandDto } from './dto/create-brand.dto.js';
import type { UpdateBrandDto } from './dto/update-brand.dto.js';

@Injectable()
export class OrganizationAdminService {
  constructor(private readonly prisma: PrismaService) {}

  listRegions() {
    return this.prisma.region.findMany({ orderBy: { code: 'asc' } });
  }

  listCountries(regionId?: string) {
    return this.prisma.country.findMany({
      where: regionId ? { regionId } : undefined,
      orderBy: { isoCode: 'asc' },
    });
  }

  listOrganizationRegions(organizationId: string) {
    return this.prisma.organizationRegion.findMany({
      where: { organizationId },
      include: { region: true },
      orderBy: { region: { code: 'asc' } },
    });
  }

  async attachRegion(organizationId: string, dto: AttachRegionDto) {
    const region = await this.prisma.region.findUnique({ where: { id: dto.regionId } });
    if (!region) {
      throw new NotFoundException('Region not found');
    }

    try {
      await this.prisma.organizationRegion.create({
        data: { organizationId, regionId: dto.regionId },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Region already attached to organization');
      }
      throw error;
    }

    return region;
  }

  async detachRegion(organizationId: string, regionId: string) {
    const dependentCountries = await this.prisma.organizationCountry.count({
      where: { organizationId, regionId },
    });
    if (dependentCountries > 0) {
      throw new BadRequestException('Detach organization countries in this region first');
    }

    try {
      await this.prisma.organizationRegion.delete({
        where: { organizationId_regionId: { organizationId, regionId } },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Organization region not found');
      }
      throw error;
    }
  }

  async listOrganizationCountries(organizationId: string) {
    const rows = await this.prisma.organizationCountry.findMany({
      where: { organizationId },
      include: { country: true },
      orderBy: { country: { isoCode: 'asc' } },
    });
    return rows.map((row) => row.country);
  }

  async attachCountry(organizationId: string, dto: AttachCountryDto) {
    const country = await this.prisma.country.findUnique({ where: { id: dto.countryId } });
    if (!country) {
      throw new NotFoundException('Country not found');
    }

    const orgRegion = await this.prisma.organizationRegion.findUnique({
      where: {
        organizationId_regionId: { organizationId, regionId: country.regionId },
      },
    });
    if (!orgRegion) {
      throw new BadRequestException('Attach the country region to the organization first');
    }

    try {
      await this.prisma.organizationCountry.create({
        data: {
          organizationId,
          countryId: country.id,
          regionId: country.regionId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Country already attached to organization');
      }
      throw error;
    }

    return country;
  }

  async detachCountry(organizationId: string, countryId: string) {
    const storeCount = await this.prisma.store.count({
      where: { organizationId, countryId },
    });
    if (storeCount > 0) {
      throw new BadRequestException('Detach or reassign stores in this country first');
    }

    try {
      await this.prisma.organizationCountry.delete({
        where: { organizationId_countryId: { organizationId, countryId } },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Organization country not found');
      }
      throw error;
    }
  }

  listBrands(organizationId: string) {
    return this.prisma.brand.findMany({
      where: { organizationId },
      orderBy: { code: 'asc' },
    });
  }

  async getBrand(organizationId: string, brandId: string): Promise<Brand> {
    const brand = await this.prisma.brand.findFirst({
      where: { id: brandId, organizationId },
    });
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return brand;
  }

  async createBrand(user: AppUser, dto: CreateBrandDto): Promise<Brand> {
    try {
      return await this.prisma.brand.create({
        data: {
          organizationId: user.organizationId,
          code: dto.code,
          name: dto.name,
          createdBy: user.displayName,
          updatedBy: user.displayName,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Brand code already exists');
      }
      throw error;
    }
  }

  async updateBrand(user: AppUser, brandId: string, dto: UpdateBrandDto): Promise<Brand> {
    await this.getBrand(user.organizationId, brandId);

    return this.prisma.brand.update({
      where: { id: brandId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        updatedBy: user.displayName,
      },
    });
  }
}
