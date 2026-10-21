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
    me: ReturnType<typeof vi.fn>;
  };

  const session = {
    accessToken: 'access',
    refreshToken: 'refresh',
    expiresIn: 3600,
    roles: [{ code: 'SUPER_ADMIN', name: 'Super Admin' }],
    permissions: ['org.manage'],
  };

  beforeEach(async () => {
    service = {
      login: vi.fn().mockResolvedValue(session),
      refresh: vi.fn().mockResolvedValue({
        ...session,
        accessToken: 'access-2',
        refreshToken: 'refresh-2',
      }),
      logout: vi.fn().mockResolvedValue(undefined),
      me: vi.fn().mockResolvedValue({
        id: 'user-1',
        email: 'johndoe@mock.com',
        roles: session.roles,
        permissions: session.permissions,
      }),
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

    await expect(controller.login(dto)).resolves.toEqual(session);
    expect(service.login).toHaveBeenCalledWith(dto);
  });

  it('delegates refresh', async () => {
    await expect(controller.refresh({ refreshToken: 'refresh' })).resolves.toEqual({
      ...session,
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
    });
  });

  it('delegates logout', async () => {
    await expect(controller.logout({ refreshToken: 'refresh' })).resolves.toBeUndefined();
    expect(service.logout).toHaveBeenCalledWith('refresh');
  });

  it('delegates me', async () => {
    const user = { id: 'user-1', email: 'johndoe@mock.com' } as never;
    await expect(controller.me(user)).resolves.toMatchObject({
      id: 'user-1',
      roles: session.roles,
      permissions: session.permissions,
    });
    expect(service.me).toHaveBeenCalledWith(user);
  });
});
