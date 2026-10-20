import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppUserStatus } from '../../../generated/prisma/client.js';

export class AuthUserProfileDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  organizationId: string;

  @ApiProperty()
  externalSubject: string;

  @ApiPropertyOptional({ nullable: true })
  employeeNumber: string | null;

  @ApiProperty()
  displayName: string;

  @ApiProperty({ format: 'email' })
  email: string;

  @ApiProperty({ enum: AppUserStatus, enumName: 'AppUserStatus' })
  status: AppUserStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  pinSetAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}
