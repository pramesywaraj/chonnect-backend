import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Message, MessageStatus, Room, RoomUser, User } from '../../entities';

import MessageController from './message.controller';
import MessageService from './message.service';
import { MessageGateway } from './message.gateway';
import { MessageStatusService } from './message-status.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Room, RoomUser, Message, MessageStatus])],
  controllers: [MessageController],
  providers: [MessageService, MessageGateway, MessageStatusService],
  exports: [MessageGateway],
})
export default class MessageModule {}
