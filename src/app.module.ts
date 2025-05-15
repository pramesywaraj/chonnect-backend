import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import CommonModule from './common/common.module';
import UserModule from './modules/user/user.module';
import AuthModule from './modules/auth/auth.module';
import RoomModule from './modules/room/room.module';

@Module({
  imports: [CommonModule, UserModule, AuthModule, RoomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
