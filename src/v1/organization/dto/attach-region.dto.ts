import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AttachRegionDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  regionId: string;
}
