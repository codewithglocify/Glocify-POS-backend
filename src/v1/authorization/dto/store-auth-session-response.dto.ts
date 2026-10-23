import { ApiProperty } from '@nestjs/swagger';
import { StoreResponseDto } from '../../store/dto/store-response.dto.js';
import { AuthSessionResponseDto } from './auth-session-response.dto.js';

export class StoreAuthSessionResponseDto extends AuthSessionResponseDto {
  @ApiProperty({ type: StoreResponseDto })
  store: StoreResponseDto;
}
