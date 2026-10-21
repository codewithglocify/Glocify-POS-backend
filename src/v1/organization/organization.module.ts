import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { OrganizationService } from './organization.service.js';
import { OrganizationController } from './organization.controller.js';

@Module({
  imports: [AuthorizationModule],
  controllers: [OrganizationController],
  providers: [OrganizationService],
})
export class OrganizationModule {}
