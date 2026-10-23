import { Body, Controller, Get, HttpCode, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CurrentUser, Public } from '@nestjs/authentication';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AppUser } from '../../generated/prisma/client.js';
import { AuthorizationService } from './authorization.service.js';
import { AdminPasswordLoginDto } from './dto/admin-password-login.dto.js';
import { AuthMeResponseDto } from './dto/auth-me-response.dto.js';
import { AuthSessionResponseDto } from './dto/auth-session-response.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';

@ApiTags('Admin Session')
@ApiBearerAuth('bearer')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('admin/v1/session')
export class AdminSessionController {
  constructor(private readonly authorizationService: AuthorizationService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Admin console login with email and password (Company Admin)' })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiForbiddenResponse({ description: 'Not Company Admin' })
  login(@Body() dto: AdminPasswordLoginDto) {
    return this.authorizationService.adminLogin(dto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Exchange a refresh token for a new token pair' })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  @ApiUnauthorizedResponse()
  refresh(@Body() dto: RefreshDto) {
    return this.authorizationService.refresh(dto.refreshToken);
  }

  @HttpCode(204)
  @Post('logout')
  @ApiOperation({ summary: 'Revoke the admin session refresh token' })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse()
  async logout(@Body() dto: RefreshDto): Promise<void> {
    await this.authorizationService.logout(dto.refreshToken);
  }

  @Get('me')
  @ApiOperation({ summary: 'Authenticated profile with roles and permissions' })
  @ApiOkResponse({ type: AuthMeResponseDto })
  @ApiUnauthorizedResponse()
  me(@CurrentUser() user: AppUser) {
    return this.authorizationService.me(user);
  }
}
