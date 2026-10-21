import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminGeographyController } from './admin-geography.controller.js';
import { OrganizationAdminService } from './organization-admin.service.js';

describe('AdminGeographyController', () => {
  let controller: AdminGeographyController;
  let service: {
    ensureRegions: ReturnType<typeof vi.fn>;
    ensureCountries: ReturnType<typeof vi.fn>;
    listRegions: ReturnType<typeof vi.fn>;
  };

  const user = { organizationId: 'org-1' } as never;

  beforeEach(async () => {
    service = {
      ensureRegions: vi.fn().mockResolvedValue([{ id: 'region-1', code: 'NAM' }]),
      ensureCountries: vi.fn().mockResolvedValue([{ id: 'country-1', isoCode: 'US' }]),
      listRegions: vi.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminGeographyController],
      providers: [{ provide: OrganizationAdminService, useValue: service }],
    }).compile();

    controller = module.get(AdminGeographyController);
  });

  it('delegates batch region attach', async () => {
    await expect(controller.batchAttachRegions(user, { regionIds: ['region-1'] })).resolves.toEqual([
      { id: 'region-1', code: 'NAM' },
    ]);
    expect(service.ensureRegions).toHaveBeenCalledWith('org-1', ['region-1']);
  });

  it('delegates batch country attach', async () => {
    await expect(controller.batchAttachCountries(user, { countryIds: ['country-1'] })).resolves.toEqual([
      { id: 'country-1', isoCode: 'US' },
    ]);
    expect(service.ensureCountries).toHaveBeenCalledWith('org-1', ['country-1']);
  });
});
