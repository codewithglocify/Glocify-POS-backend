import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class SetPosPinDto {
  @ApiProperty({ example: '1234', description: '4-digit or 6-digit PIN' })
  @Matches(/^[0-9]{4}$|^[0-9]{6}$/)
  pin: string;
}
