import { ApiProperty } from '@nestjs/swagger';

export class AuthRoleDto {
  @ApiProperty({ example: 'SUPER_ADMIN' })
  code: string;

  @ApiProperty({ example: 'Super Admin' })
  name: string;
}
