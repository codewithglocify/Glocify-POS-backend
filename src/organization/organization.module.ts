import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service.js';
import { OrganizationController } from './organization.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [OrganizationController],
  providers: [OrganizationService],
})
export class OrganizationModule {}
