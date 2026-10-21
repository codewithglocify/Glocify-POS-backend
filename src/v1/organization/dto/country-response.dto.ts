import { ApiProperty } from '@nestjs/swagger';
import { PriceTaxMode, TaxModel } from '../../../generated/prisma/client.js';

export class CountryResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  regionId: string;

  @ApiProperty()
  isoCode: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  defaultCurrencyCode: string;

  @ApiProperty()
  defaultLanguageCode: string;

  @ApiProperty()
  timezone: string;

  @ApiProperty({ enum: TaxModel, enumName: 'TaxModel' })
  taxModel: TaxModel;

  @ApiProperty({ enum: PriceTaxMode, enumName: 'PriceTaxMode' })
  priceTaxMode: PriceTaxMode;

  @ApiProperty()
  fiscalRegime: string;
}
