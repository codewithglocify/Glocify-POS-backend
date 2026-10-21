import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StockPositionDto {
  @ApiProperty({ format: 'uuid' })
  storeId: string;

  @ApiProperty()
  sku: string;

  @ApiPropertyOptional({ nullable: true })
  onHand: string | null;

  @ApiPropertyOptional({ nullable: true })
  availableToSell: string | null;

  @ApiPropertyOptional({ nullable: true })
  reserved: string | null;

  @ApiProperty()
  sourceSystem: string;

  @ApiProperty({ type: String, format: 'date-time' })
  asOf: Date;
}
