import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AttachCountryDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  countryId: string;
}
