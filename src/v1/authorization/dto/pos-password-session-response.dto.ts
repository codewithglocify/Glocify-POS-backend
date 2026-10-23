import { ApiProperty } from '@nestjs/swagger';
import { AuthSessionResponseDto } from './auth-session-response.dto.js';

export class PosPasswordSessionResponseDto extends AuthSessionResponseDto {
  @ApiProperty()
  pinSet: boolean;

  @ApiProperty({ format: 'uuid' })
  userId: string;
}
