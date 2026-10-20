import type { AppUser } from '../../generated/prisma/client.js';

declare module '@nestjs/authentication' {
  interface AuthenticationTypes {
    user: AppUser;
  }
}
