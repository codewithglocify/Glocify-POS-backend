import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AppUser } from '../../generated/prisma/client.js';
import { CreateStoreDto } from './dto/create-store.dto.js';
import { StoreResponseDto } from './dto/store-response.dto.js';
import { UpdateStoreDto } from './dto/update-store.dto.js';
import { StoreService } from './store.service.js';

@ApiTags('Admin')
@ApiBearerAuth('bearer')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('v1/admin/stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a store',
    description: 'Intended for Country Manager workflows (seed-only permissions).',
  })
  @ApiCreatedResponse({ type: StoreResponseDto })
  @ApiConflictResponse()
  @ApiUnauthorizedResponse()
  create(@CurrentUser() user: AppUser, @Body() dto: CreateStoreDto) {
    return this.storeService.create(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List stores for the caller organization' })
  @ApiOkResponse({ type: [StoreResponseDto] })
  @ApiUnauthorizedResponse()
  findAll(@CurrentUser() user: AppUser, @Query('countryId') countryId?: string) {
    return this.storeService.list(user.organizationId, countryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one store' })
  @ApiOkResponse({ type: StoreResponseDto })
  @ApiUnauthorizedResponse()
  findOne(@CurrentUser() user: AppUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.storeService.findOne(user.organizationId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a store' })
  @ApiOkResponse({ type: StoreResponseDto })
  @ApiUnauthorizedResponse()
  update(@CurrentUser() user: AppUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStoreDto) {
    return this.storeService.update(user, id, dto);
  }
}
