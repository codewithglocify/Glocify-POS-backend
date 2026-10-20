import { Injectable } from '@nestjs/common';
import { AuthenticationRegistry, JwtBearerProvider, type JwtClaims } from '@nestjs/authentication';
import type { AppUser } from '../../generated/prisma/client.js';
import { AppUserStatus } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class JwtAuth extends JwtBearerProvider<AppUser> {
  constructor(
    private readonly prisma: PrismaService,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerProvider(this, { order: 1 });
  }

  async validate({ sub }: JwtClaims): Promise<AppUser | null> {
    if (!sub) {
      return null;
    }

    const user = await this.prisma.appUser.findUnique({
      where: { id: sub },
    });

    if (!user || user.status !== AppUserStatus.ACTIVE) {
      return null;
    }

    return user;
  }
}
