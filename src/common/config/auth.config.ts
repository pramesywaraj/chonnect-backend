import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  jwt: {
    secret: string;
    expires_in: string;
  };
}

export const authConfig = registerAs(
  'auth',
  (): AuthConfig => ({
    jwt: {
      secret: process.env.JWT_SECRET as string,
      expires_in: process.env.JWT_EXPIRES_IN ?? '60m',
    },
  }),
);
