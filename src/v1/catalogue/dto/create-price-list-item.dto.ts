import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class CreatePriceListItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  priceListId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  variantId: string;

  @ApiProperty({ example: '195.0000' })
  @IsString()
  @Matches(/^\d+(\.\d{1,4})?$/)
  unitPrice: string;

  @ApiPropertyOptional({ example: '220.0000' })
  @IsOptional()
  @IsString()
  @Matches(/^\d+(\.\d{1,4})?$/)
  compareAtPrice?: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  effectiveFrom: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  effectiveTo?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sourceDocument?: string;
}
