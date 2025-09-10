import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Room, RoomUser } from '../../entities';
import UserService from '../user/user.service';
import { CreateRoomRequestDto, RoomResponseDto } from './dtos';
import { UserRoles } from '../user/enums/role.enum';
import { CursorPaginationQueryParamsDto } from 'src/dto/pagination.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export default class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,

    @InjectRepository(RoomUser)
    private readonly roomUserRepository: Repository<RoomUser>,

    private readonly userService: UserService,
  ) {}

  public async create(
    creatorId: string,
    createRoomRequestDto: CreateRoomRequestDto,
  ): Promise<Room> {
    const creator = await this.userService.findOneById(creatorId);
    if (!creator) throw new NotFoundException('Creator not found');

    const roomName = createRoomRequestDto.name;
    const isOneOnOne = createRoomRequestDto.participant_ids.length === 1;

    if (isOneOnOne) {
      const otherUserId = createRoomRequestDto.participant_ids[0];
      const isOneOnOneRoomExist = await this.roomRepository
        .createQueryBuilder('room')
        .innerJoin('room.room_user', 'roomUser1', 'roomUser1.user.id = :creatorId', { creatorId })
        .innerJoin('room.room_user', 'roomUser2', 'roomUser2.user.id = :otherUserId', {
          otherUserId,
        })
        .groupBy('room.id')
        .having('COUNT(room.id) = 1')
        .andHaving('room.is_group = FALSE')
        .getOne();

      if (isOneOnOneRoomExist) throw new ConflictException('Room already exists');
    }

    const room = this.roomRepository.create({
      name: roomName,
      is_group: !isOneOnOne,
    });

    await this.roomRepository.save(room);

    const participants = await this.userService.findByIds([
      creatorId,
      ...createRoomRequestDto.participant_ids,
    ]);

    const roomUser = participants.map((user) => {
      const isCreator = user.id === creatorId;
      let role = isCreator ? UserRoles.ADMIN : UserRoles.MEMBER;

      if (isOneOnOne && !isCreator) role = UserRoles.ADMIN;

      return this.roomUserRepository.create({
        room,
        user,
        role,
        joined_at: new Date(),
      });
    });

    await this.roomUserRepository.save(roomUser);

    return room;
  }

  public async getRoomDetail(roomId: string, userId: string): Promise<Room | null> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['room_user', 'room_user.user', 'last_message', 'last_message.sender'],
    });

    if (room && userId && !room.is_group) {
      // For one-on-one rooms, get the partner's name
      const partner = room.room_user.find((ru) => ru.user.id !== userId);
      if (partner) {
        room.name = partner.user.name || partner.user.email;
      }
    }

    return room;
  }

  public async getAllUserRooms(
    user_id: string,
    pagination: CursorPaginationQueryParamsDto,
  ): Promise<{ rooms: RoomResponseDto[]; has_more: boolean; next_cursor: string | null }> {
    const { before, limit = 20 } = pagination;

    let query = this.roomRepository
      .createQueryBuilder('room')
      .innerJoin('room.room_user', 'roomUser', 'roomUser.user.id = :user_id', { user_id })
      // join room with room user to see
      // all the participants on that room
      .leftJoinAndSelect('room.room_user', 'room_user')
      .leftJoinAndSelect('room_user.user', 'participant')
      .addSelect([
        'room_user.id',
        'room_user.role',
        'room_user.joined_at',
        'participant.id',
        'participant.name',
        'participant.profile_image',
      ])
      // join the room with message to see
      // the last message of that room
      .leftJoinAndSelect('room.last_message', 'last_message')
      .leftJoinAndSelect('last_message.sender', 'sender')
      .leftJoin('last_message.statuses', 'message_status', 'message_status.user.id = :user_id', {
        user_id,
      })
      .addSelect([
        'message_status.id',
        'message_status.status',
        'message_status.created_at',
        'message_status.updated_at',
        'message_status.read_at',
      ])
      .where('participant.id != :user_id', { user_id })
      .orderBy('COALESCE(last_message.created_at, room.created_at)', 'DESC')
      .limit(limit + 1);

    if (before) {
      query = query.andWhere('room.id < :before', { before });
    }

    const rooms = await query.getMany();

    const has_more = rooms.length > limit;
    const items = has_more ? rooms.slice(0, limit) : rooms;
    const next_cursor = has_more ? items[items.length - 1].id : null;

    const processedRooms = items.map((room) => {
      if (!room.is_group) {
        // For one-on-one rooms, find the partner (other user)
        const partner = room.room_user.find((ru) => ru.user.id !== user_id);
        if (partner) {
          room.name = partner.user.name || partner.user.email;
        }
      }

      const last_message = room.last_message;
      const last_message_status = last_message?.statuses?.[0] ?? null;

      const newShapedRoom = {
        ...room,
        last_message: last_message
          ? {
              id: last_message.id,
              content: last_message.content,
              sender: last_message.sender,
              status: last_message_status,
              is_user_message: last_message.sender.id === user_id,
              created_at: last_message.created_at,
            }
          : null,
      };

      return plainToInstance(RoomResponseDto, newShapedRoom, {
        exposeDefaultValues: true,
      });
    });

    return {
      rooms: processedRooms,
      next_cursor,
      has_more,
    };
  }
}
