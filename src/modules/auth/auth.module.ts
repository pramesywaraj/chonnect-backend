import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthConfig } from '../../common/config/auth.config';
import { TypedConfigService } from '../../common/typed-config.service';

import AuthService from './auth.service';
import AuthController from './auth.controller';
import UserModule from '../user/user.module';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: TypedConfigService) => ({
        secret: config.get<AuthConfig>('auth')?.jwt.secret,
        signOptions: {
          expiresIn: config.get<AuthConfig>('auth')?.jwt?.expires_in,
        },
      }),
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export default class AuthModule {}
