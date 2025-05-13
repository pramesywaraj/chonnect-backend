import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { jwtConfig, refreshJwtConfig } from '../../common/config/auth.config';

import AuthService from './auth.service';
import AuthController from './auth.controller';
import UserModule from '../user/user.module';

import { LocalStrategy, JwtStrategy } from './strategies';
import RefreshJwtStrategy from './strategies/refresh-jwt.strategy';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshJwtStrategy],
  controllers: [AuthController],
})
export default class AuthModule {}
