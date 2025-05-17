import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Room, RoomUser } from '../../entities';
import UserService from '../user/user.service';
import { CreateRoomDto } from './dtos';
import { UserRoles } from '../user/enums/role.enum';

@Injectable()
export default class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,

    @InjectRepository(RoomUser)
    private readonly roomUserRepository: Repository<RoomUser>,

    private readonly userService: UserService,
  ) {}

  public async create(creatorId: string, createRoomDto: CreateRoomDto): Promise<Room> {
    const creator = await this.userService.findOneById(creatorId);
    if (!creator) throw new NotFoundException('Creator not found');

    const isOneOnOne = createRoomDto.participant_ids.length === 1;

    if (isOneOnOne) {
      const otherUserId = createRoomDto.participant_ids[0];
      const isOneOnOneRoomExist = await this.roomRepository
        .createQueryBuilder('room')
        .innerJoin('room.room_user', 'roomUser1', 'roomUser1.user.id = :creatorId', { creatorId })
        .innerJoin('room.room_user', 'roomUser2', 'roomUser2.user.id = :otherUserId', {
          otherUserId,
        })
        .groupBy('room.id')
        .having('COUNT(room.id) = 1')
        .getOne();

      if (isOneOnOneRoomExist) throw new ConflictException('Room already exists');
    }

    const room = this.roomRepository.create({
      name: isOneOnOne ? null : createRoomDto.name,
      is_group: !isOneOnOne,
    });

    await this.roomRepository.save(room);

    const participants = await this.userService.findByIds([
      creatorId,
      ...createRoomDto.participant_ids,
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

  public async getAllUserRooms(userId: string): Promise<Room[]> {
    return this.roomRepository
      .createQueryBuilder('room')
      .innerJoin('room.room_user', 'roomUser', 'roomUser.user.id = :userId', { userId })
      .getMany();
  }
}
