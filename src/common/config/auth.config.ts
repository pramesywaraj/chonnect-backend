import { registerAs } from '@nestjs/config';
import { JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';

export const jwtConfig = registerAs(
  'auth-jwt',
  (): JwtModuleOptions => ({
    secret: process.env.JWT_ACCESS_SECRET as string,
    signOptions: {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '1d',
    },
  }),
);

export const refreshJwtConfig = registerAs(
  'auth-jwt-refresh',
  (): JwtSignOptions => ({
    secret: process.env.JWT_REFRESH_SECRET as string,
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  }),
);
