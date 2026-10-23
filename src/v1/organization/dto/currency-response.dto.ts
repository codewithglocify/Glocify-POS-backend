import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CurrencyResponseDto {
  @ApiProperty({ example: 'INR', description: 'ISO 4217 alphabetic code' })
  code: string;

  @ApiProperty({ example: '356', description: 'ISO 4217 numeric code' })
  numericCode: string;

  @ApiProperty({ example: 2 })
  minorUnits: number;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: '1.0000',
    description: 'Cash rounding increment as a decimal string',
  })
  cashRoundingIncrement: string | null;

  @ApiProperty({ example: 'Indian Rupee' })
  name: string;

  @ApiProperty()
  isActive: boolean;
}
