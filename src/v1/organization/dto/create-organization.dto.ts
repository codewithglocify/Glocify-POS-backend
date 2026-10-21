import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, IsUUID } from 'class-validator';

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

  @ApiPropertyOptional({
    type: [String],
    format: 'uuid',
    description: 'Optional region IDs to attach during onboard',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  regionIds?: string[];

  @ApiPropertyOptional({
    type: [String],
    format: 'uuid',
    description: 'Optional country IDs to attach during onboard (auto-attaches parent regions)',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  countryIds?: string[];
}
