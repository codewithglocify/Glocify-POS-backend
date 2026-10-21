import { Module } from '@nestjs/common';
import { AdminCatalogueController } from './admin-catalogue.controller.js';
import { CatalogueAdminService } from './catalogue-admin.service.js';
import { CatalogueSearchService } from './catalogue-search.service.js';
import { PosCatalogueController } from './pos-catalogue.controller.js';
import { PriceResolutionService } from './price-resolution.service.js';
import { StockService } from './stock.service.js';

@Module({
  controllers: [PosCatalogueController, AdminCatalogueController],
  providers: [PriceResolutionService, CatalogueSearchService, StockService, CatalogueAdminService],
  exports: [PriceResolutionService, CatalogueSearchService, StockService],
})
export class CatalogueModule {}
