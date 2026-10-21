import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, Matches } from 'class-validator';
import { StoreConcept } from '../../../generated/prisma/client.js';

export class CreateStoreDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  brandId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  countryId: string;

  @ApiProperty({ example: 'US-NYC-01' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  code: string;

  @ApiProperty({ example: 'New York Flagship' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ enum: StoreConcept, enumName: 'StoreConcept' })
  @IsOptional()
  @IsEnum(StoreConcept)
  concept?: StoreConcept;

  @ApiPropertyOptional({
    description: 'Defaults to the country timezone when omitted',
    example: 'America/New_York',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Defaults to the country default currency when omitted',
    example: 'USD',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currencyCode?: string;

  @ApiPropertyOptional({
    description: 'Defaults to the country default language when omitted',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  languageCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  taxJurisdictionCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postalCode?: string;
}
