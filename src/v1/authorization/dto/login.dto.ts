import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsUUID, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ format: 'uuid', example: '11111111-1111-1111-1111-111111111111' })
  @IsUUID()
  organizationId: string;

  @ApiProperty({ format: 'email', example: 'johndoe@mock.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'mock@123', minLength: 1 })
  @IsString()
  @MinLength(1)
  pin: string;
}
