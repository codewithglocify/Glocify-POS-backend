import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordHasher, TokenService } from '@nestjs/authentication';
import type { AppUser } from '../../generated/prisma/client.js';
import { AppUserStatus } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { LoginDto } from './dto/login.dto.js';

export type AuthUserProfile = Omit<AppUser, 'pinHash'>;

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async login(dto: LoginDto) {
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

    return this.tokens.issue(user.id, {
      method: 'pin',
      claims: { organizationId: user.organizationId },
    });
  }

  refresh(refreshToken: string) {
    return this.tokens.refresh(refreshToken);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokens.revoke(refreshToken);
  }

  toProfile(user: AppUser): AuthUserProfile {
    const { pinHash: _pinHash, ...profile } = user;
    return profile;
  }
}
