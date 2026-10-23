import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
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
import { CatalogueAdminService } from './catalogue-admin.service.js';
import { AssignStorePriceListDto } from './dto/assign-store-price-list.dto.js';
import { CreateBarcodeDto } from './dto/create-barcode.dto.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { CreatePriceListDto } from './dto/create-price-list.dto.js';
import { CreatePriceListItemDto } from './dto/create-price-list-item.dto.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { StockPositionDto } from './dto/stock-position.dto.js';
import { UpsertStockDto } from './dto/upsert-stock.dto.js';
import { StockService } from './stock.service.js';

@ApiTags('Admin')
@ApiBearerAuth('bearer')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
@Controller('admin/v1')
export class AdminCatalogueController {
  constructor(
    private readonly catalogueAdminService: CatalogueAdminService,
    private readonly stockService: StockService,
  ) {}

  @Post('categories')
  @ApiOperation({
    summary: 'Create a category',
    description: 'Intended for Store Admin workflows (seed-only permissions).',
  })
  @ApiCreatedResponse()
  @ApiConflictResponse()
  @ApiUnauthorizedResponse()
  createCategory(@CurrentUser() user: AppUser, @Body() dto: CreateCategoryDto) {
    return this.catalogueAdminService.createCategory(user.organizationId, dto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List categories' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  listCategories(@CurrentUser() user: AppUser) {
    return this.catalogueAdminService.listCategories(user.organizationId);
  }

  @Post('products')
  @ApiOperation({ summary: 'Create a product with variants' })
  @ApiCreatedResponse()
  @ApiConflictResponse()
  @ApiUnauthorizedResponse()
  createProduct(@CurrentUser() user: AppUser, @Body() dto: CreateProductDto) {
    return this.catalogueAdminService.createProduct(user.organizationId, dto);
  }

  @Get('products')
  @ApiOperation({ summary: 'List products with variants' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  listProducts(@CurrentUser() user: AppUser) {
    return this.catalogueAdminService.listProducts(user.organizationId);
  }

  @Post('barcodes')
  @ApiOperation({ summary: 'Add a barcode to a variant' })
  @ApiCreatedResponse()
  @ApiConflictResponse()
  @ApiUnauthorizedResponse()
  addBarcode(@CurrentUser() user: AppUser, @Body() dto: CreateBarcodeDto) {
    return this.catalogueAdminService.addBarcode(user.organizationId, dto);
  }

  @Post('price-lists')
  @ApiOperation({ summary: 'Create a price list' })
  @ApiCreatedResponse()
  @ApiConflictResponse()
  @ApiUnauthorizedResponse()
  createPriceList(@CurrentUser() user: AppUser, @Body() dto: CreatePriceListDto) {
    return this.catalogueAdminService.createPriceList(user.organizationId, dto);
  }

  @Post('price-list-items')
  @ApiOperation({ summary: 'Add a price list item (effective-dated)' })
  @ApiCreatedResponse()
  @ApiUnauthorizedResponse()
  createPriceListItem(@CurrentUser() user: AppUser, @Body() dto: CreatePriceListItemDto) {
    return this.catalogueAdminService.upsertPriceListItem(user.organizationId, dto);
  }

  @Post('store-price-lists')
  @ApiOperation({ summary: 'Assign a price list to a store' })
  @ApiCreatedResponse()
  @ApiUnauthorizedResponse()
  assignStorePriceList(@CurrentUser() user: AppUser, @Body() dto: AssignStorePriceListDto) {
    return this.catalogueAdminService.assignStorePriceList(user.organizationId, dto);
  }

  @Post('stock-positions')
  @ApiOperation({ summary: 'Upsert cached stock for a store SKU' })
  @ApiOkResponse({ type: StockPositionDto })
  @ApiUnauthorizedResponse()
  upsertStock(@CurrentUser() user: AppUser, @Body() dto: UpsertStockDto) {
    return this.stockService.upsert(user.organizationId, dto);
  }
}
