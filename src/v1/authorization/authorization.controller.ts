import { Body, Controller, Get, HttpCode, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CurrentUser, Public } from '@nestjs/authentication';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AppUser } from '../../generated/prisma/client.js';
import { AuthorizationService } from './authorization.service.js';
import { AuthMeResponseDto } from './dto/auth-me-response.dto.js';
import { AuthSessionResponseDto } from './dto/auth-session-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';

@ApiTags('Authorization')
@ApiBearerAuth('bearer')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('v1/authorization')
export class AuthorizationController {
  constructor(private readonly authorizationService: AuthorizationService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Sign in with organization, email, and PIN' })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() loginDto: LoginDto) {
    return this.authorizationService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Exchange a refresh token for a new token pair' })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  refresh(@Body() refreshDto: RefreshDto) {
    return this.authorizationService.refresh(refreshDto.refreshToken);
  }

  @HttpCode(204)
  @Post('logout')
  @ApiOperation({ summary: 'Revoke a refresh token' })
  @ApiNoContentResponse({ description: 'Refresh token revoked (or already invalid)' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  async logout(@Body() refreshDto: RefreshDto): Promise<void> {
    await this.authorizationService.logout(refreshDto.refreshToken);
  }

  @Get('me')
  @ApiOperation({ summary: 'Return the authenticated user profile with roles and permissions' })
  @ApiOkResponse({ type: AuthMeResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  me(@CurrentUser() user: AppUser) {
    return this.authorizationService.me(user);
  }
}
