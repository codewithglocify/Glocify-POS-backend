import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CurrentUser } from '@nestjs/authentication';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AppUser } from '../../generated/prisma/client.js';
import { AttachCountryDto } from './dto/attach-country.dto.js';
import { AttachRegionDto } from './dto/attach-region.dto.js';
import { BatchAttachCountriesDto } from './dto/batch-attach-countries.dto.js';
import { BatchAttachRegionsDto } from './dto/batch-attach-regions.dto.js';
import { CountryResponseDto } from './dto/country-response.dto.js';
import { RegionResponseDto } from './dto/region-response.dto.js';
import { OrganizationAdminService } from './organization-admin.service.js';

@ApiTags('Admin')
@ApiBearerAuth('bearer')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('v1/admin')
export class AdminGeographyController {
  constructor(private readonly organizationAdminService: OrganizationAdminService) {}

  @Get('regions')
  @ApiOperation({
    summary: 'List master regions',
    description: 'Intended for HQ Admin / Country Manager workflows (seed-only permissions).',
  })
  @ApiOkResponse({ type: [RegionResponseDto] })
  @ApiUnauthorizedResponse()
  listRegions() {
    return this.organizationAdminService.listRegions();
  }

  @Get('countries')
  @ApiOperation({ summary: 'List master countries' })
  @ApiOkResponse({ type: [CountryResponseDto] })
  @ApiUnauthorizedResponse()
  listCountries(@Query('regionId') regionId?: string) {
    return this.organizationAdminService.listCountries(regionId);
  }

  @Get('organizations/me/regions')
  @ApiOperation({ summary: 'List regions attached to the caller organization' })
  @ApiOkResponse({ type: [RegionResponseDto] })
  @ApiUnauthorizedResponse()
  async listOrganizationRegions(@CurrentUser() user: AppUser) {
    const rows = await this.organizationAdminService.listOrganizationRegions(user.organizationId);
    return rows.map((row) => row.region);
  }

  @Post('organizations/me/regions')
  @ApiOperation({ summary: 'Attach a region to the caller organization' })
  @ApiCreatedResponse({ type: RegionResponseDto })
  @ApiConflictResponse()
  @ApiUnauthorizedResponse()
  attachRegion(@CurrentUser() user: AppUser, @Body() dto: AttachRegionDto) {
    return this.organizationAdminService.attachRegion(user.organizationId, dto);
  }

  @Post('organizations/me/regions/batch')
  @ApiOperation({
    summary: 'Batch-attach regions to the caller organization',
    description: 'Idempotent. Intended for HQ Admin / Country Manager workflows (seed-only permissions).',
  })
  @ApiOkResponse({ type: [RegionResponseDto] })
  @ApiUnauthorizedResponse()
  batchAttachRegions(@CurrentUser() user: AppUser, @Body() dto: BatchAttachRegionsDto) {
    return this.organizationAdminService.ensureRegions(user.organizationId, dto.regionIds);
  }

  @HttpCode(204)
  @Delete('organizations/me/regions/:regionId')
  @ApiOperation({ summary: 'Detach a region from the caller organization' })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse()
  async detachRegion(@CurrentUser() user: AppUser, @Param('regionId', ParseUUIDPipe) regionId: string): Promise<void> {
    await this.organizationAdminService.detachRegion(user.organizationId, regionId);
  }

  @Get('organizations/me/countries')
  @ApiOperation({ summary: 'List countries attached to the caller organization' })
  @ApiOkResponse({ type: [CountryResponseDto] })
  @ApiUnauthorizedResponse()
  listOrganizationCountries(@CurrentUser() user: AppUser) {
    return this.organizationAdminService.listOrganizationCountries(user.organizationId);
  }

  @Post('organizations/me/countries')
  @ApiOperation({
    summary: 'Attach a country to the caller organization',
    description: 'Requires the country region to already be attached.',
  })
  @ApiCreatedResponse({ type: CountryResponseDto })
  @ApiConflictResponse()
  @ApiUnauthorizedResponse()
  attachCountry(@CurrentUser() user: AppUser, @Body() dto: AttachCountryDto) {
    return this.organizationAdminService.attachCountry(user.organizationId, dto);
  }

  @Post('organizations/me/countries/batch')
  @ApiOperation({
    summary: 'Batch-attach countries to the caller organization',
    description:
      'Idempotent. Auto-attaches each country’s parent region. Intended for HQ Admin / Country Manager (seed-only).',
  })
  @ApiOkResponse({ type: [CountryResponseDto] })
  @ApiUnauthorizedResponse()
  batchAttachCountries(@CurrentUser() user: AppUser, @Body() dto: BatchAttachCountriesDto) {
    return this.organizationAdminService.ensureCountries(user.organizationId, dto.countryIds);
  }

  @HttpCode(204)
  @Delete('organizations/me/countries/:countryId')
  @ApiOperation({ summary: 'Detach a country from the caller organization' })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse()
  async detachCountry(
    @CurrentUser() user: AppUser,
    @Param('countryId', ParseUUIDPipe) countryId: string,
  ): Promise<void> {
    await this.organizationAdminService.detachCountry(user.organizationId, countryId);
  }
}
