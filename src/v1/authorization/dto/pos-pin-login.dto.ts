import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUUID, MinLength, ValidateIf } from 'class-validator';

export class PosPinLoginDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  organizationId: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ format: 'email' })
  @ValidateIf((dto: PosPinLoginDto) => !dto.userId)
  @IsEmail()
  email?: string;

  @ApiProperty({ minLength: 1 })
  @IsString()
  @MinLength(1)
  pin: string;
}
