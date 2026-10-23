import { Module } from '@nestjs/common';
import { AuthorizationService } from './authorization.service.js';
import { AdminSessionController } from './admin-session.controller.js';
import { PosSessionController } from './pos-session.controller.js';
import { JwtAuth } from './jwt.provider.js';
import './authentication.types.js';

@Module({
  controllers: [AdminSessionController, PosSessionController],
  providers: [AuthorizationService, JwtAuth],
  exports: [AuthorizationService],
})
export class AuthorizationModule {}
