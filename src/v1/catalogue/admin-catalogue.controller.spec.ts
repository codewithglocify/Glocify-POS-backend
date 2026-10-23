import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminCatalogueController } from './admin-catalogue.controller.js';
import { CatalogueAdminService } from './catalogue-admin.service.js';
import { StockService } from './stock.service.js';

describe('AdminCatalogueController price lists', () => {
  let controller: AdminCatalogueController;
  let catalogue: {
    listPriceLists: ReturnType<typeof vi.fn>;
    createPriceList: ReturnType<typeof vi.fn>;
    listPriceListItems: ReturnType<typeof vi.fn>;
  };

  const user = { organizationId: 'org-1' } as never;

  beforeEach(async () => {
    catalogue = {
      listPriceLists: vi.fn().mockResolvedValue([{ id: 'list-1' }]),
      createPriceList: vi.fn().mockResolvedValue({ id: 'list-1' }),
      listPriceListItems: vi.fn().mockResolvedValue([{ id: 'item-1' }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminCatalogueController],
      providers: [
        { provide: CatalogueAdminService, useValue: catalogue },
        { provide: StockService, useValue: { upsert: vi.fn() } },
      ],
    }).compile();

    controller = module.get(AdminCatalogueController);
  });

  it('lists price lists for the caller organization', async () => {
    await expect(controller.listPriceLists(user)).resolves.toEqual([{ id: 'list-1' }]);
    expect(catalogue.listPriceLists).toHaveBeenCalledWith('org-1');
  });

  it('creates a price list for the caller organization', async () => {
    const dto = { code: 'IN-FP-INR', currencyCode: 'INR', sourceSystem: 'POS' };
    await expect(controller.createPriceList(user, dto)).resolves.toEqual({ id: 'list-1' });
    expect(catalogue.createPriceList).toHaveBeenCalledWith('org-1', dto);
  });

  it('lists price list items for the caller organization', async () => {
    await expect(controller.listPriceListItems(user)).resolves.toEqual([{ id: 'item-1' }]);
    expect(catalogue.listPriceListItems).toHaveBeenCalledWith('org-1');
  });
});
