import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Room, RoomUser } from '../../entities';
import UserModule from '../user/user.module';

import RoomService from './room.service';
import RoomController from './room.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Room, RoomUser]), UserModule],
  providers: [RoomService],
  controllers: [RoomController],
})
export default class RoomModule {}
