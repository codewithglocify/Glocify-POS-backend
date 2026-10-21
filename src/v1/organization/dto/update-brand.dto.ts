import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ActiveStatus } from '../../../generated/prisma/client.js';

export class UpdateBrandDto {
  @ApiPropertyOptional({ example: 'Fashion Store' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ enum: ActiveStatus, enumName: 'ActiveStatus' })
  @IsOptional()
  @IsEnum(ActiveStatus)
  status?: ActiveStatus;
}
