import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { AdminBrandController } from './admin-brand.controller.js';
import { AdminGeographyController } from './admin-geography.controller.js';
import { OrganizationAdminService } from './organization-admin.service.js';
import { OrganizationController } from './organization.controller.js';
import { OrganizationService } from './organization.service.js';

@Module({
  imports: [AuthorizationModule],
  controllers: [OrganizationController, AdminGeographyController, AdminBrandController],
  providers: [OrganizationService, OrganizationAdminService],
  exports: [OrganizationAdminService],
})
export class OrganizationModule {}
