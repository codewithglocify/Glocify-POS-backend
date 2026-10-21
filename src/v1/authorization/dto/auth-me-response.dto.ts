import { ApiProperty } from '@nestjs/swagger';
import { AuthRoleDto } from './auth-role.dto.js';
import { AuthUserProfileDto } from './auth-user-profile.dto.js';

export class AuthMeResponseDto extends AuthUserProfileDto {
  @ApiProperty({ type: [AuthRoleDto] })
  roles: AuthRoleDto[];

  @ApiProperty({
    type: [String],
    description: "Unique permission codes from the user's valid role assignments",
    example: ['org.manage', 'pos.sale'],
  })
  permissions: string[];
}
