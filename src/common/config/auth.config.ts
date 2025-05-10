import { registerAs } from '@nestjs/config';

interface AuthConfigKeys {
  secret: string;
  expires_in: string;
}

export interface AuthConfig {
  jwt: {
    access_token: AuthConfigKeys;
    refresh_token: AuthConfigKeys;
  };
}

export const authConfig = registerAs(
  'auth',
  (): AuthConfig => ({
    jwt: {
      access_token: {
        secret: process.env.JWT_ACCESS_SECRET as string,
        expires_in: process.env.JWT_ACCESS_EXPIRES_IN ?? '1d',
      },
      refresh_token: {
        secret: process.env.JWT_REFRESH_SECRET as string,
        expires_in: process.env.JWT_REFRESH_EXPIRES_IN ?? '7 days',
      },
    },
  }),
);
