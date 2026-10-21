import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PasswordHasher, TokenService } from '@nestjs/authentication';
import type { AppUser } from '../../generated/prisma/client.js';
import { AppUserStatus } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { LoginDto } from './dto/login.dto.js';

export type AuthUserProfile = Omit<AppUser, 'pinHash'>;

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

export type AuthMeResult = AuthUserProfile & AuthzPayload;

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async login(dto: LoginDto): Promise<AuthSessionResult> {
    const user = await this.prisma.appUser.findFirst({
      where: {
        organizationId: dto.organizationId,
        email: dto.email,
      },
    });

    const pinValid = await this.passwordHasher.verify(
      dto.pin,
      user?.status === AppUserStatus.ACTIVE ? user.pinHash : undefined,
    );

    if (!user || user.status !== AppUserStatus.ACTIVE || !pinValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (this.passwordHasher.needsRehash(user.pinHash)) {
      const pinHash = await this.passwordHasher.hash(dto.pin);
      await this.prisma.appUser.update({
        where: { id: user.id },
        data: { pinHash, pinSetAt: new Date() },
      });
    }

    const tokens = await this.tokens.issue(user.id, {
      method: 'pin',
      claims: { organizationId: user.organizationId },
    });

    if (!('refreshToken' in tokens)) {
      throw new InternalServerErrorException('Refresh tokens are not configured');
    }

    const authz = await this.getAuthzForUser(user.id);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      ...authz,
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

  async getAuthzForUser(userId: string): Promise<AuthzPayload> {
    const now = new Date();
    const assignments = await this.prisma.userAssignment.findMany({
      where: {
        userId,
        validFrom: { lte: now },
        OR: [{ validTill: null }, { validTill: { gt: now } }],
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

    const rolesByCode = new Map<string, AuthRole>();
    const permissionCodes = new Set<string>();

    for (const assignment of assignments) {
      const { role } = assignment;
      if (!rolesByCode.has(role.code)) {
        rolesByCode.set(role.code, { code: role.code, name: role.name });
      }
      for (const rolePermission of role.rolePermissions) {
        permissionCodes.add(rolePermission.permission.code);
      }
    }

    return {
      roles: [...rolesByCode.values()],
      permissions: [...permissionCodes].sort(),
    };
  }

  toProfile(user: AppUser): AuthUserProfile {
    const { pinHash: _pinHash, ...profile } = user;
    return profile;
  }

  /** Payload decode of an access token we just minted (no signature check). */
  private subjectFromAccessToken(accessToken: string): string {
    const parts = accessToken.split('.');
    if (parts.length < 2 || !parts[1]) {
      throw new UnauthorizedException('Invalid access token');
    }

    try {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as { sub?: string };

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
