import { ApiProperty } from '@nestjs/swagger';
import { ActiveStatus } from '../../../generated/prisma/client.js';

export class BrandResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  organizationId: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ActiveStatus, enumName: 'ActiveStatus' })
  status: ActiveStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty()
  createdBy: string;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;

  @ApiProperty()
  updatedBy: string;
}
