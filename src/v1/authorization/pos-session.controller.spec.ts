import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PosSessionController } from './pos-session.controller.js';
import { AuthorizationService } from './authorization.service.js';

describe('PosSessionController', () => {
  let controller: PosSessionController;
  let service: {
    posPasswordLogin: ReturnType<typeof vi.fn>;
    setPosPin: ReturnType<typeof vi.fn>;
    posPinLogin: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      posPasswordLogin: vi.fn().mockResolvedValue({ pinSet: false, userId: 'u1' }),
      setPosPin: vi.fn().mockResolvedValue(undefined),
      posPinLogin: vi.fn().mockResolvedValue({ store: { code: 'IN-BOM-01' } }),
      logout: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PosSessionController],
      providers: [{ provide: AuthorizationService, useValue: service }],
    }).compile();

    controller = module.get(PosSessionController);
  });

  it('delegates password login', async () => {
    const dto = { organizationId: 'org-1', email: 'a@b.com', password: 'x' };
    await expect(controller.login(dto)).resolves.toMatchObject({ pinSet: false });
    expect(service.posPasswordLogin).toHaveBeenCalledWith(dto);
  });

  it('delegates pin login', async () => {
    const dto = { organizationId: 'org-1', userId: 'u1', pin: '1234' };
    await expect(controller.pinLogin(dto)).resolves.toMatchObject({ store: { code: 'IN-BOM-01' } });
  });
});
