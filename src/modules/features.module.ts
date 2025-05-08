import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import AuthController from './auth/auth.controller';

import AuthService from './auth/auth.service';
import UserService from './user/user.service';
import PasswordService from './user/password.service';
import { User } from '../entities/user.entity';

import { TypedConfigService } from '../common/typed-config.service';
import { AuthConfig } from '../common/config/auth.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
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
  providers: [AuthService, UserService, PasswordService],
  controllers: [AuthController],
})
export default class FeaturesModule {}
