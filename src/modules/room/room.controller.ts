import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Request,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';

import { Room } from '../../entities';

import RoomService from './room.service';
import { CreateRoomRequestDto, RoomResponseDto } from './dtos';
import { AuthRequest } from 'src/types/auth.type';
import { SuccessMessage } from 'src/common/decorators';
import { plainToInstance } from 'class-transformer';

@Controller('room')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
export default class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @SuccessMessage('Room created successfully')
  @Post()
  create(
    @Request() req: AuthRequest,
    @Body() createRoomRequestDto: CreateRoomRequestDto,
  ): Promise<Room> {
    return this.roomService.create(req.user.sub, createRoomRequestDto);
  }

  @SuccessMessage("User's rooms has been fetched")
  @Get()
  async getUserRooms(@Request() req: AuthRequest): Promise<RoomResponseDto[]> {
    const rooms = await this.roomService.getAllUserRooms(req.user.sub);

    return rooms.map((room) => plainToInstance(RoomResponseDto, room));
  }
}
