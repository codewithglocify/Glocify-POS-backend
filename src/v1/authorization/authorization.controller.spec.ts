import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthorizationController } from './authorization.controller.js';
import { AuthorizationService } from './authorization.service.js';

describe('AuthorizationController', () => {
  let controller: AuthorizationController;
  let service: {
    login: ReturnType<typeof vi.fn>;
    refresh: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    toProfile: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      login: vi.fn().mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 3600,
      }),
      refresh: vi.fn().mockResolvedValue({
        accessToken: 'access-2',
        refreshToken: 'refresh-2',
        expiresIn: 3600,
      }),
      logout: vi.fn().mockResolvedValue(undefined),
      toProfile: vi.fn().mockReturnValue({ id: 'user-1', email: 'johndoe@mock.com' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorizationController],
      providers: [{ provide: AuthorizationService, useValue: service }],
    }).compile();

    controller = module.get(AuthorizationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates login', async () => {
    const dto = {
      organizationId: 'org-1',
      email: 'johndoe@mock.com',
      pin: 'mock@123',
    };

    await expect(controller.login(dto)).resolves.toEqual({
      accessToken: 'access',
      refreshToken: 'refresh',
      expiresIn: 3600,
    });
    expect(service.login).toHaveBeenCalledWith(dto);
  });

  it('delegates refresh', async () => {
    await expect(
      controller.refresh({ refreshToken: 'refresh' }),
    ).resolves.toEqual({
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
      expiresIn: 3600,
    });
  });

  it('delegates logout', async () => {
    await expect(
      controller.logout({ refreshToken: 'refresh' }),
    ).resolves.toBeUndefined();
    expect(service.logout).toHaveBeenCalledWith('refresh');
  });
});
