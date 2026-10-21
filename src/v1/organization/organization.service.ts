import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PasswordHasher, TokenService } from '@nestjs/authentication';
import {
  ActiveStatus,
  AppUserStatus,
  Prisma,
  ScopeType,
  type AppUser,
  type Organization,
} from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  AuthorizationService,
  type AuthUserProfile,
  type AuthzPayload,
} from '../authorization/authorization.service.js';
import type { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { SUPER_ADMIN_ROLE_CODE, SUPER_ADMIN_ROLE_NAME } from '../../constants/roles.constants.js';

export type OrganizationOnboardResult = AuthzPayload & {
  organization: Pick<Organization, 'id' | 'code' | 'legalName' | 'status' | 'createdAt' | 'updatedAt'>;
  user: AuthUserProfile;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

@Injectable()
export class OrganizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokens: TokenService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async create(dto: CreateOrganizationDto): Promise<OrganizationOnboardResult> {
    const pinHash = await this.passwordHasher.hash(dto.password);

    let organization: Organization;
    let user: AppUser;

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const organization = await tx.organization.create({
          data: {
            code: dto.code,
            legalName: dto.legalName,
            status: ActiveStatus.ACTIVE,
            createdBy: dto.username,
            updatedBy: dto.username,
          },
        });

        const role = await tx.role.create({
          data: {
            organizationId: organization.id,
            code: SUPER_ADMIN_ROLE_CODE,
            name: SUPER_ADMIN_ROLE_NAME,
            description: 'Full access for the organization owner',
          },
        });

        const permissions = await tx.permission.findMany({
          select: { id: true },
        });

        if (permissions.length > 0) {
          await tx.rolePermission.createMany({
            data: permissions.map((permission) => ({
              roleId: role.id,
              permissionId: permission.id,
            })),
          });
        }

        const externalSubject = `${organization.id}:${dto.employeeNumber ?? crypto.randomUUID()}`;

        const user = await tx.appUser.create({
          data: {
            organizationId: organization.id,
            email: dto.email,
            displayName: dto.username,
            externalSubject,
            employeeNumber: dto.employeeNumber,
            pinHash,
            pinSetAt: new Date(),
            status: AppUserStatus.ACTIVE,
          },
        });

        await tx.userAssignment.create({
          data: {
            userId: user.id,
            roleId: role.id,
            scopeType: ScopeType.ORGANIZATION,
            scopeId: organization.id,
          },
        });

        return { organization, user };
      });

      organization = created.organization;
      user = created.user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Organization code already exists');
      }
      throw error;
    }

    const tokens = await this.tokens.issue(user.id, {
      method: 'password',
      claims: { organizationId: organization.id },
    });

    if (!('refreshToken' in tokens)) {
      throw new InternalServerErrorException('Refresh tokens are not configured');
    }

    const authz = await this.authorizationService.getAuthzForUser(user.id);

    return {
      organization: {
        id: organization.id,
        code: organization.code,
        legalName: organization.legalName,
        status: organization.status,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      },
      user: this.toProfile(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      ...authz,
    };
  }

  private toProfile(user: AppUser): AuthUserProfile {
    const { pinHash: _pinHash, ...profile } = user;
    return profile;
  }
}
