import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Room, RoomUser } from '../../entities';
import UserService from '../user/user.service';
import { CreateRoomRequestDto } from './dtos';
import { UserRoles } from '../user/enums/role.enum';
import { CursorPaginationQueryParamsDto } from 'src/dto/pagination.dto';

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
    userId: string,
    pagination: CursorPaginationQueryParamsDto,
  ): Promise<{ rooms: Room[]; has_more: boolean; next_cursor: string | null }> {
    const { before, limit = 20 } = pagination;

    let query = this.roomRepository
      .createQueryBuilder('room')
      .innerJoin('room.room_user', 'roomUser', 'roomUser.user.id = :userId', { userId })
      // join room with room user to see
      // all the participants on that room
      .leftJoin('room.room_user', 'participants')
      .leftJoin('participants.user', 'participant')
      .addSelect([
        'participants.id',
        'participants.role',
        'participants.joined_at',
        'participant.id',
        'participant.name',
        'participant.profile_image',
      ])
      // join the room with message to see
      // the last message of that room
      .leftJoinAndSelect('room.last_message', 'last_message')
      .leftJoinAndSelect('last_message.sender', 'sender')
      .leftJoin('last_message.statuses', 'message_statuses', 'message_statuses.user.id = :userId', {
        userId,
      })
      .addSelect(['message_statuses.id', 'message_statuses.status', 'message_statuses.created_at'])
      .where('participant.id != :userId', { userId })
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
        const partner = room.room_user.find((ru) => ru.user.id !== userId);
        if (partner) {
          room.name = partner.user.name || partner.user.email;
        }
      }
      return room;
    });

    return {
      rooms: processedRooms,
      next_cursor,
      has_more,
    };
  }
}
