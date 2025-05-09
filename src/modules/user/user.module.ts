import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../entities';

import UserService from './user.service';
import PasswordService from './password.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, PasswordService],
  exports: [UserService, PasswordService],
})
export default class UserModule {}
