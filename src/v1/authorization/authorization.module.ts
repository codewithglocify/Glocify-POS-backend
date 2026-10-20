import { Module } from '@nestjs/common';
import { AuthorizationService } from './authorization.service.js';
import { AuthorizationController } from './authorization.controller.js';
import { JwtAuth } from './jwt.provider.js';
import './authentication.types.js';

@Module({
  controllers: [AuthorizationController],
  providers: [AuthorizationService, JwtAuth],
})
export class AuthorizationModule {}
