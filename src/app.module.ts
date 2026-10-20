import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticationModule, type Duration } from '@nestjs/authentication';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { OrganizationModule } from './organization/organization.module.js';
import { AuthorizationModule } from './v1/authorization/authorization.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthenticationModule.forRootAsync({
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return {
          allowInMemoryStorage: true,
          accessToken: {
            key: config.getOrThrow<string>('JWT_SECRET'),
            issuer: config.getOrThrow<string>('JWT_ISSUER'),
            audience: config.getOrThrow<string>('JWT_AUDIENCE'),
            ttl: (config.get<string>('JWT_TTL') ?? '1h') as Duration,
          },
        };
      },
    }),
    PrismaModule,
    OrganizationModule,
    AuthorizationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
