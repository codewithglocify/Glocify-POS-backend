import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { Public } from '@nestjs/authentication';
import { ApiConflictResponse, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { OrganizationOnboardResponseDto } from './dto/organization-onboard-response.dto.js';
import { OrganizationService } from './organization.service.js';

@ApiTags('Organization')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('v1/organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Onboard an organization' })
  @ApiCreatedResponse({ type: OrganizationOnboardResponseDto })
  @ApiConflictResponse({ description: 'Organization code already exists' })
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrganizationDto);
  }
}
