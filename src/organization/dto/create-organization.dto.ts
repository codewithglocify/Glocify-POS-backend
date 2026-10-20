import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

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

  @ApiProperty({
    format: 'password',
    example: 'Str0ng!Passw0rd',
    description: 'Must satisfy class-validator IsStrongPassword rules',
  })
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}
