import { ApiProperty } from '@nestjs/swagger';
import { ActiveStatus } from '../../../generated/prisma/client.js';
import { AuthRoleDto } from '../../authorization/dto/auth-role.dto.js';
import { AuthUserProfileDto } from '../../authorization/dto/auth-user-profile.dto.js';
import { TokenPairDto } from '../../authorization/dto/token-pair.dto.js';

export class OrganizationSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  legalName: string;

  @ApiProperty({ enum: ActiveStatus, enumName: 'ActiveStatus' })
  status: ActiveStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}

export class OrganizationOnboardResponseDto extends TokenPairDto {
  @ApiProperty({ type: OrganizationSummaryDto })
  organization: OrganizationSummaryDto;

  @ApiProperty({ type: AuthUserProfileDto })
  user: AuthUserProfileDto;

  @ApiProperty({ type: [AuthRoleDto] })
  roles: AuthRoleDto[];

  @ApiProperty({
    type: [String],
    description: "Unique permission codes from the user's valid role assignments",
    example: ['org.manage', 'pos.sale'],
  })
  permissions: string[];
}
