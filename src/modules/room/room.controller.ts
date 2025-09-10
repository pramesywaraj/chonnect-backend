import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
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
import { CursorPaginationDto, CursorPaginationQueryParamsDto } from 'src/dto/pagination.dto';

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
  async getUserRooms(
    @Request() req: AuthRequest,
    @Query() pagination: CursorPaginationQueryParamsDto,
  ): Promise<CursorPaginationDto<RoomResponseDto>> {
    const { rooms, has_more, next_cursor } = await this.roomService.getAllUserRooms(
      req.user.sub,
      pagination,
    );

    return new CursorPaginationDto(rooms, has_more, next_cursor);
  }

  @SuccessMessage('Room detail has been fetched')
  @Get(':roomId')
  async getRoomDetail(
    @Request() req: AuthRequest,
    @Param('roomId') roomId: string,
  ): Promise<RoomResponseDto> {
    const userId = req.user.sub;
    const room = await this.roomService.getRoomDetail(roomId, userId);

    if (!room) throw new NotFoundException('Room not found');

    return plainToInstance(RoomResponseDto, room);
  }
}
