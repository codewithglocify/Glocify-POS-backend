import { ApiProperty } from '@nestjs/swagger';
import { AuthRoleDto } from './auth-role.dto.js';
import { TokenPairDto } from './token-pair.dto.js';

export class AuthSessionResponseDto extends TokenPairDto {
  @ApiProperty({ type: [AuthRoleDto] })
  roles: AuthRoleDto[];

  @ApiProperty({
    type: [String],
    description: "Unique permission codes from the user's valid role assignments",
    example: ['org.manage', 'pos.sale'],
  })
  permissions: string[];
}
