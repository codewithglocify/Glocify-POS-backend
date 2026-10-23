import { Body, Controller, HttpCode, Post, UsePipes, ValidationPipe } from '@nestjs/common';
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
import { PosPasswordLoginDto } from './dto/pos-password-login.dto.js';
import { PosPasswordSessionResponseDto } from './dto/pos-password-session-response.dto.js';
import { PosPinLoginDto } from './dto/pos-pin-login.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';
import { SetPosPinDto } from './dto/set-pos-pin.dto.js';
import { StoreAuthSessionResponseDto } from './dto/store-auth-session-response.dto.js';

@ApiTags('POS Session')
@ApiBearerAuth('bearer')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('pos/v1/session')
export class PosSessionController {
  constructor(private readonly authorizationService: AuthorizationService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'First POS sign-in with email and password' })
  @ApiOkResponse({ type: PosPasswordSessionResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  login(@Body() dto: PosPasswordLoginDto) {
    return this.authorizationService.posPasswordLogin(dto);
  }

  @HttpCode(204)
  @Post('pin')
  @ApiOperation({ summary: 'Set 4-digit or 6-digit PIN after password login' })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse()
  async setPin(@CurrentUser() user: AppUser, @Body() dto: SetPosPinDto): Promise<void> {
    await this.authorizationService.setPosPin(user, dto);
  }

  @Public()
  @Post('pin-login')
  @ApiOperation({ summary: 'Later POS sign-in with PIN; returns assigned LIVE store' })
  @ApiOkResponse({ type: StoreAuthSessionResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  pinLogin(@Body() dto: PosPinLoginDto) {
    return this.authorizationService.posPinLogin(dto);
  }

  @HttpCode(204)
  @Post('logout')
  @ApiOperation({ summary: 'Revoke the POS session refresh token' })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse()
  async logout(@Body() dto: RefreshDto): Promise<void> {
    await this.authorizationService.logout(dto.refreshToken);
  }
}
