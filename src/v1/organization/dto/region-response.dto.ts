import { ApiProperty } from '@nestjs/swagger';
import { DataPlane } from '../../../generated/prisma/client.js';

export class RegionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: DataPlane, enumName: 'DataPlane' })
  dataPlane: DataPlane;
}
