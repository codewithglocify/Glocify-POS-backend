import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

export class CreateProductVariantDto {
  @ApiProperty({ example: 'FS1001-BLK-STD' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  sku: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  size?: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'ART-10001' })
  @IsString()
  @IsNotEmpty()
  sapArticle: string;

  @ApiPropertyOptional({ example: 'FS1001' })
  @IsOptional()
  @IsString()
  styleNumber?: string;

  @ApiProperty({ example: 'Classic Watch' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'STANDARD' })
  @IsString()
  @IsNotEmpty()
  taxClassCode: string;

  @ApiProperty({ type: [CreateProductVariantDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants: CreateProductVariantDto[];
}
