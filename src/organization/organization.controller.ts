import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { OrganizationService } from './organization.service.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { UpdateOrganizationDto } from './dto/update-organization.dto.js';

@ApiTags('Organization')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UsePipes(ValidationPipe)
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @ApiOperation({ summary: 'Create an organization (stub)' })
  @ApiOkResponse({ type: CreateOrganizationDto })
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrganizationDto);
  }

  @Get()
  @ApiOperation({ summary: 'List organizations (stub)' })
  @ApiOkResponse({ schema: { type: 'string' } })
  findAll() {
    return this.organizationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an organization by id (stub)' })
  @ApiOkResponse({ schema: { type: 'string' } })
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an organization (stub)' })
  @ApiOkResponse({ schema: { type: 'string' } })
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationService.update(+id, updateOrganizationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an organization (stub)' })
  @ApiOkResponse({ schema: { type: 'string' } })
  remove(@Param('id') id: string) {
    return this.organizationService.remove(+id);
  }
}
