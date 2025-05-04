import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import AuthController from './auth/auth.controller';

import AuthService from './auth/auth.service';
import UserService from './user/user.service';
import PasswordService from './user/password.service';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AuthService, UserService, PasswordService],
  controllers: [AuthController],
})
export default class FeaturesModule {}
