import { ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PasswordHasher, TokenService } from '@nestjs/authentication';
import type { AppUser, Store } from '../../generated/prisma/client.js';
import { AppUserStatus, AssignmentScopeType, AuthSurface, StoreStatus } from '../../generated/prisma/client.js';
import {
  COMPANY_ADMIN_ROLE_CODE,
  STORE_ADMIN_ROLE_CODE,
  STORE_USER_ROLE_CODE,
} from '../../constants/roles.constants.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { AdminPasswordLoginDto } from './dto/admin-password-login.dto.js';
import type { PosPasswordLoginDto } from './dto/pos-password-login.dto.js';
import type { PosPinLoginDto } from './dto/pos-pin-login.dto.js';
import type { SetPosPinDto } from './dto/set-pos-pin.dto.js';

export type AuthUserProfile = Omit<AppUser, 'passwordHash' | 'pinHash'>;

export type AuthRole = {
  code: string;
  name: string;
};

export type AuthzPayload = {
  roles: AuthRole[];
  permissions: string[];
};

export type AuthSessionResult = AuthzPayload & {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type PosPasswordSessionResult = AuthSessionResult & {
  pinSet: boolean;
  userId: string;
};

export type StoreAuthSessionResult = AuthSessionResult & {
  store: Store;
};

export type AuthMeResult = AuthUserProfile & AuthzPayload;

type AssignmentWithRole = {
  id: string;
  scopeType: AssignmentScopeType;
  scopeId: string;
  role: {
    code: string;
    name: string;
    allowedAssignmentScopes: AssignmentScopeType[];
    rolePermissions: {
      permission: {
        code: string;
        surfaces: AuthSurface[];
        allowedScopeTypes: AssignmentScopeType[];
      };
    }[];
  };
};

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async adminLogin(dto: AdminPasswordLoginDto): Promise<AuthSessionResult> {
    const user = await this.authenticateWithPassword(dto.organizationId, dto.email, dto.password);

    const assignments = await this.findValidAssignments(user.id, {
      roleCode: COMPANY_ADMIN_ROLE_CODE,
      scopeType: AssignmentScopeType.ORGANIZATION,
      scopeId: user.organizationId,
    });

    if (assignments.length !== 1) {
      throw new ForbiddenException('Admin console requires Company Admin');
    }

    return this.issueSession(user, { organizationId: user.organizationId }, assignments, 'password');
  }

  async posPasswordLogin(dto: PosPasswordLoginDto): Promise<PosPasswordSessionResult> {
    const user = await this.authenticateWithPassword(dto.organizationId, dto.email, dto.password);

    const assignments = await this.findValidAssignments(user.id, {
      scopeType: AssignmentScopeType.STORE,
      roleCodes: [STORE_ADMIN_ROLE_CODE, STORE_USER_ROLE_CODE],
    });

    if (assignments.length === 0) {
      throw new ForbiddenException('POS access requires a store role assignment');
    }

    const session = await this.issueSession(user, { organizationId: user.organizationId }, assignments, 'password');

    return {
      ...session,
      pinSet: Boolean(user.pinHash && user.pinSetAt),
      userId: user.id,
    };
  }

  async setPosPin(user: AppUser, dto: SetPosPinDto): Promise<void> {
    if (user.status !== AppUserStatus.ACTIVE) {
      throw new ForbiddenException('User is not active');
    }

    const pinHash = await this.passwordHasher.hash(dto.pin);
    await this.prisma.appUser.update({
      where: { id: user.id },
      data: {
        pinHash,
        pinLength: dto.pin.length,
        pinSetAt: new Date(),
      },
    });
  }

  async posPinLogin(dto: PosPinLoginDto): Promise<StoreAuthSessionResult> {
    const user = await this.prisma.appUser.findFirst({
      where: dto.userId
        ? { id: dto.userId, organizationId: dto.organizationId }
        : { organizationId: dto.organizationId, email: dto.email },
    });

    const pinValid = await this.passwordHasher.verify(
      dto.pin,
      user?.status === AppUserStatus.ACTIVE ? (user.pinHash ?? undefined) : undefined,
    );

    if (!user || user.status !== AppUserStatus.ACTIVE || !user.pinHash || !pinValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const assignments = await this.findValidAssignments(user.id, {
      scopeType: AssignmentScopeType.STORE,
      roleCodes: [STORE_ADMIN_ROLE_CODE, STORE_USER_ROLE_CODE],
    });

    if (assignments.length !== 1) {
      throw new ForbiddenException('Store PIN login requires a single store assignment');
    }

    const assignment = assignments[0]!;
    const store = await this.prisma.store.findFirst({
      where: {
        id: assignment.scopeId,
        organizationId: user.organizationId,
        status: StoreStatus.LIVE,
      },
    });

    if (!store) {
      throw new ForbiddenException('Assigned store is not available');
    }

    // storeId is part of the refresh-token family claims and is preserved on refresh().
    return {
      ...(await this.issueSession(
        user,
        { organizationId: user.organizationId, storeId: store.id },
        assignments,
        'pin',
      )),
      store,
    };
  }

  async refresh(refreshToken: string): Promise<AuthSessionResult> {
    const tokens = await this.tokens.refresh(refreshToken);
    const userId = this.subjectFromAccessToken(tokens.accessToken);
    const authz = await this.getAuthzForUser(userId);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      ...authz,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokens.revoke(refreshToken);
  }

  async me(user: AppUser): Promise<AuthMeResult> {
    const authz = await this.getAuthzForUser(user.id);
    return {
      ...this.toProfile(user),
      ...authz,
    };
  }

  async getAuthzForUser(userId: string, surface?: AuthSurface): Promise<AuthzPayload> {
    const assignments = await this.findValidAssignments(userId);
    return this.authzFromAssignments(assignments, surface);
  }

  /**
   * Effective permissions for a target resource and client surface (ADR-010).
   * Containment: ORGANIZATION contains all; STORE only itself (brand/region/country deferred).
   */
  async getEffectivePermissions(params: {
    userId: string;
    surface: AuthSurface;
    targetScopeType: AssignmentScopeType;
    targetScopeId: string;
    organizationId: string;
  }): Promise<AuthzPayload> {
    const assignments = await this.findValidAssignments(params.userId);
    const matching = assignments.filter((assignment) => this.assignmentContainsTarget(assignment, params));
    return this.authzFromAssignments(matching, params.surface);
  }

  toProfile(user: AppUser): AuthUserProfile {
    const { passwordHash: _passwordHash, pinHash: _pinHash, ...profile } = user;
    return profile;
  }

  private async authenticateWithPassword(organizationId: string, email: string, password: string): Promise<AppUser> {
    const user = await this.prisma.appUser.findFirst({
      where: { organizationId, email },
    });

    const passwordValid = await this.passwordHasher.verify(
      password,
      user?.status === AppUserStatus.ACTIVE ? (user.passwordHash ?? undefined) : undefined,
    );

    if (!user || user.status !== AppUserStatus.ACTIVE || !user.passwordHash || !passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (this.passwordHasher.needsRehash(user.passwordHash)) {
      const passwordHash = await this.passwordHasher.hash(password);
      await this.prisma.appUser.update({
        where: { id: user.id },
        data: { passwordHash },
      });
    }

    return user;
  }

  private async issueSession(
    user: AppUser,
    claims: Record<string, unknown>,
    assignments: AssignmentWithRole[],
    method: string,
  ): Promise<AuthSessionResult> {
    const tokens = await this.tokens.issue(user.id, { method, claims });
    if (!('refreshToken' in tokens)) {
      throw new InternalServerErrorException('Refresh tokens are not configured');
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      ...this.authzFromAssignments(assignments),
    };
  }

  private async findValidAssignments(
    userId: string,
    filter?: {
      roleCode?: string;
      roleCodes?: string[];
      scopeType?: AssignmentScopeType;
      scopeId?: string;
    },
  ): Promise<AssignmentWithRole[]> {
    const now = new Date();
    const roleFilter = filter?.roleCode
      ? { code: filter.roleCode }
      : filter?.roleCodes?.length
        ? { code: { in: filter.roleCodes } }
        : undefined;

    return this.prisma.userAssignment.findMany({
      where: {
        userId,
        validFrom: { lte: now },
        OR: [{ validTo: null }, { validTo: { gt: now } }],
        ...(filter?.scopeType ? { scopeType: filter.scopeType } : {}),
        ...(filter?.scopeId ? { scopeId: filter.scopeId } : {}),
        ...(roleFilter ? { role: roleFilter } : {}),
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  private authzFromAssignments(assignments: AssignmentWithRole[], surface?: AuthSurface): AuthzPayload {
    const rolesByCode = new Map<string, AuthRole>();
    const permissionCodes = new Set<string>();

    for (const assignment of assignments) {
      const { role } = assignment;
      if (!rolesByCode.has(role.code)) {
        rolesByCode.set(role.code, { code: role.code, name: role.name });
      }
      for (const rolePermission of role.rolePermissions) {
        const permission = rolePermission.permission;
        if (surface && !permission.surfaces.includes(surface)) {
          continue;
        }
        if (!permission.allowedScopeTypes.includes(assignment.scopeType)) {
          continue;
        }
        permissionCodes.add(permission.code);
      }
    }

    return {
      roles: [...rolesByCode.values()],
      permissions: [...permissionCodes].sort(),
    };
  }

  private assignmentContainsTarget(
    assignment: AssignmentWithRole,
    params: {
      targetScopeType: AssignmentScopeType;
      targetScopeId: string;
      organizationId: string;
    },
  ): boolean {
    if (assignment.scopeType === AssignmentScopeType.ORGANIZATION) {
      return assignment.scopeId === params.organizationId;
    }
    if (assignment.scopeType === AssignmentScopeType.STORE) {
      return params.targetScopeType === AssignmentScopeType.STORE && assignment.scopeId === params.targetScopeId;
    }
    // Brand/region/country containment requires hierarchy joins; treat exact match for now.
    return assignment.scopeType === params.targetScopeType && assignment.scopeId === params.targetScopeId;
  }

  private subjectFromAccessToken(accessToken: string): string {
    const parts = accessToken.split('.');
    if (parts.length < 2 || !parts[1]) {
      throw new UnauthorizedException('Invalid access token');
    }

    try {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as {
        sub?: string;
      };

      if (!payload.sub) {
        throw new UnauthorizedException('Invalid access token');
      }

      return payload.sub;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
