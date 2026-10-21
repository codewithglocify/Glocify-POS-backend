import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CurrentUser } from '@nestjs/authentication';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AppUser } from '../../generated/prisma/client.js';
import { BrandResponseDto } from './dto/brand-response.dto.js';
import { CreateBrandDto } from './dto/create-brand.dto.js';
import { UpdateBrandDto } from './dto/update-brand.dto.js';
import { OrganizationAdminService } from './organization-admin.service.js';

@ApiTags('Admin')
@ApiBearerAuth('bearer')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('v1/admin/brands')
export class AdminBrandController {
  constructor(private readonly organizationAdminService: OrganizationAdminService) {}

  @Get()
  @ApiOperation({ summary: 'List brands for the caller organization' })
  @ApiOkResponse({ type: [BrandResponseDto] })
  @ApiUnauthorizedResponse()
  list(@CurrentUser() user: AppUser) {
    return this.organizationAdminService.listBrands(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one brand' })
  @ApiOkResponse({ type: BrandResponseDto })
  @ApiUnauthorizedResponse()
  get(@CurrentUser() user: AppUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.organizationAdminService.getBrand(user.organizationId, id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a brand',
    description: 'Intended for HQ Admin workflows (seed-only permissions).',
  })
  @ApiCreatedResponse({ type: BrandResponseDto })
  @ApiConflictResponse()
  @ApiUnauthorizedResponse()
  create(@CurrentUser() user: AppUser, @Body() dto: CreateBrandDto) {
    return this.organizationAdminService.createBrand(user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a brand' })
  @ApiOkResponse({ type: BrandResponseDto })
  @ApiUnauthorizedResponse()
  update(@CurrentUser() user: AppUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBrandDto) {
    return this.organizationAdminService.updateBrand(user, id, dto);
  }
}
