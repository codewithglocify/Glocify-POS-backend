import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrganizationController } from './organization.controller.js';
import { OrganizationService } from './organization.service.js';

describe('OrganizationController', () => {
  let controller: OrganizationController;
  let service: { create: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    service = {
      create: vi.fn().mockResolvedValue({
        organization: { id: 'org-1', code: 'acme' },
        user: { id: 'user-1', email: 'admin@acme.test' },
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 3600,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationController],
      providers: [{ provide: OrganizationService, useValue: service }],
    }).compile();

    controller = module.get(OrganizationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates create/onboard', async () => {
    const dto = {
      code: 'acme',
      legalName: 'Acme Retail Ltd',
      email: 'admin@acme.test',
      username: 'acme.admin',
      password: 'Str0ng!Passw0rd',
    };

    await expect(controller.create(dto)).resolves.toMatchObject({
      accessToken: 'access',
      organization: { code: 'acme' },
    });
    expect(service.create).toHaveBeenCalledWith(dto);
  });
});
