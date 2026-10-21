import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StoreConcept, StoreStatus } from '../../../generated/prisma/client.js';

export class StoreResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  organizationId: string;

  @ApiProperty({ format: 'uuid' })
  brandId: string;

  @ApiProperty({ format: 'uuid' })
  countryId: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: StoreConcept, enumName: 'StoreConcept' })
  concept: StoreConcept;

  @ApiProperty()
  timezone: string;

  @ApiProperty()
  currencyCode: string;

  @ApiProperty()
  languageCode: string;

  @ApiPropertyOptional({ nullable: true })
  taxJurisdictionCode: string | null;

  @ApiPropertyOptional({ nullable: true })
  addressLine1: string | null;

  @ApiPropertyOptional({ nullable: true })
  city: string | null;

  @ApiPropertyOptional({ nullable: true })
  postalCode: string | null;

  @ApiProperty({ enum: StoreStatus, enumName: 'StoreStatus' })
  status: StoreStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty()
  createdBy: string;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;

  @ApiProperty()
  updatedBy: string;
}
