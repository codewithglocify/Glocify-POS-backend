import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'acme' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Acme Retail Ltd' })
  @IsString()
  @IsNotEmpty()
  legalName: string;

  @ApiProperty({ format: 'email', example: 'admin@acme.test' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'acme.admin' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiPropertyOptional({ example: 'E10001' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  employeeNumber?: string;

  @ApiProperty({ format: 'password', example: 'Str0ng!Passw0rd' })
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}
