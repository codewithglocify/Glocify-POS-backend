import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RefreshDto {
  @ApiProperty({
    description: 'Opaque refresh token from login or a previous refresh',
    example: 'rt_abc123...',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  refreshToken: string;
}
