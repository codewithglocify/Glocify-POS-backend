import { ApiProperty } from '@nestjs/swagger';

export class TokenPairDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Opaque refresh token',
    example: 'rt_abc123...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Access token lifetime in seconds',
    example: 3600,
  })
  expiresIn: number;
}
