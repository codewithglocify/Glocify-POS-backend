import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminSessionController } from './admin-session.controller.js';
import { AuthorizationService } from './authorization.service.js';

describe('AdminSessionController', () => {
  let controller: AdminSessionController;
  let service: {
    adminLogin: ReturnType<typeof vi.fn>;
    refresh: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    me: ReturnType<typeof vi.fn>;
  };

  const session = {
    accessToken: 'access',
    refreshToken: 'refresh',
    expiresIn: 3600,
    roles: [{ code: 'COMPANY_ADMIN', name: 'Company Admin' }],
    permissions: ['config.publish'],
  };

  beforeEach(async () => {
    service = {
      adminLogin: vi.fn().mockResolvedValue(session),
      refresh: vi.fn().mockResolvedValue(session),
      logout: vi.fn().mockResolvedValue(undefined),
      me: vi.fn().mockResolvedValue({ id: 'user-1', ...session }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminSessionController],
      providers: [{ provide: AuthorizationService, useValue: service }],
    }).compile();

    controller = module.get(AdminSessionController);
  });

  it('delegates admin login', async () => {
    const dto = { organizationId: 'org-1', email: 'a@b.com', password: 'x' };
    await expect(controller.login(dto)).resolves.toEqual(session);
    expect(service.adminLogin).toHaveBeenCalledWith(dto);
  });
});
