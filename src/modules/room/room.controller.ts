import { Body, Controller, Post, Request } from '@nestjs/common';

import { Room } from '../../entities';

import RoomService from './room.service';
import { CreateRoomDto } from './dtos';
import { AuthRequest } from 'src/types/auth.type';

@Controller('room')
export default class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  create(@Request() req: AuthRequest, @Body() createRoomDto: CreateRoomDto): Promise<Room> {
    return this.roomService.create(req.user.sub, createRoomDto);
  }
}
