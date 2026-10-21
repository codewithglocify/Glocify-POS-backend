import { Controller, Get, Headers, Param, ParseUUIDPipe, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CurrentUser } from '@nestjs/authentication';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AppUser } from '../../generated/prisma/client.js';
import { CatalogueSearchService } from './catalogue-search.service.js';
import { ProductHitDto } from './dto/product-hit.dto.js';
import { StockPositionDto } from './dto/stock-position.dto.js';
import { StockService } from './stock.service.js';

@ApiTags('Catalogue')
@ApiBearerAuth('bearer')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('v1/pos')
export class PosCatalogueController {
  constructor(
    private readonly catalogueSearchService: CatalogueSearchService,
    private readonly stockService: StockService,
  ) {}

  @Get('products')
  @ApiOperation({ summary: 'Search the catalogue cache for a store' })
  @ApiHeader({ name: 'X-Store-Id', required: true })
  @ApiOkResponse({ type: [ProductHitDto] })
  @ApiUnauthorizedResponse()
  searchProducts(
    @CurrentUser() user: AppUser,
    @Headers('x-store-id') storeId: string,
    @Query('q') q?: string,
    @Query('barcode') barcode?: string,
  ) {
    return this.catalogueSearchService.search({
      organizationId: user.organizationId,
      storeId,
      q,
      barcode,
    });
  }

  @Get('stores/:storeId/stock')
  @ApiOperation({ summary: 'Read cached available-to-sell for a SKU' })
  @ApiOkResponse({ type: StockPositionDto })
  @ApiUnauthorizedResponse()
  getStock(@CurrentUser() user: AppUser, @Param('storeId', ParseUUIDPipe) storeId: string, @Query('sku') sku: string) {
    return this.stockService.getForStore(user.organizationId, storeId, sku);
  }
}
