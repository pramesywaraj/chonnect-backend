import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Room, RoomUser } from '../../entities';
import UserService from '../user/user.service';
import { CreateRoomRequestDto } from './dtos';
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

  public async create(
    creatorId: string,
    createRoomRequestDto: CreateRoomRequestDto,
  ): Promise<Room> {
    const creator = await this.userService.findOneById(creatorId);
    if (!creator) throw new NotFoundException('Creator not found');

    let roomName = createRoomRequestDto.name;
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

      const otherUser = await this.userService.findOneById(otherUserId);

      roomName = otherUser?.name ?? otherUser?.email;
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

  public async getAllUserRooms(userId: string): Promise<Room[]> {
    return (
      this.roomRepository
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
        .where('participant.id != :userId', { userId })
        .getMany()
    );
  }
}
