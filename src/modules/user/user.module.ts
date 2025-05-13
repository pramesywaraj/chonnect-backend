import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../entities';

import UserService from './user.service';
import PasswordService from './password.service';
import UserController from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, PasswordService],
  exports: [UserService, PasswordService],
  controllers: [UserController],
})
export default class UserModule {}
