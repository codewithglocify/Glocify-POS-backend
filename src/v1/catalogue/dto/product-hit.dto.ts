import { ApiProperty } from '@nestjs/swagger';

export class ProductHitDto {
  @ApiProperty({ example: 'FS1001-BLK-STD' })
  sku: string;

  @ApiProperty({ example: 'Classic Watch' })
  name: string;

  @ApiProperty({ description: 'Decimal string money amount', example: '195.0000' })
  unitPrice: string;

  @ApiProperty({ example: 'USD' })
  currencyCode: string;
}
