import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type Repository } from 'typeorm';

import { Message, MessageStatus, Room, RoomUser, User } from '../../entities';
import { CreateMessageRequestDto, MessageResponseDto } from './dtos';

import { MessageStatusEnum } from '../../enums/message.enum';
import { CursorPaginationQueryParamsDto } from 'src/dto/pagination.dto';
import { MessageGateway } from './message.gateway';
import { plainToInstance } from 'class-transformer';
import { RoomResponseDto } from '../room/dtos';

@Injectable()
export default class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(MessageStatus)
    private readonly messageStatusRepository: Repository<MessageStatus>,
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomUser) private readonly roomUserRepository: Repository<RoomUser>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly messageGateway: MessageGateway,
  ) {}

  public async sendMessage(senderId: string, createMessageRequestDto: CreateMessageRequestDto) {
    const { content, room_id } = createMessageRequestDto;

    const room = await this.roomRepository.findOneBy({ id: room_id });
    if (!room) throw new NotFoundException('Room not found or available');

    const sender = await this.userRepository.findOneBy({ id: senderId });
    if (!sender) throw new NotFoundException('Sender not found or registered');

    const message = this.messageRepository.create({
      room,
      sender,
      content,
    });

    await this.messageRepository.save(message);

    const roomUsers = await this.roomUserRepository.find({
      where: { room: { id: room_id } },
      relations: ['user', 'room'],
    });

    const statuses = roomUsers
      .filter((room) => room.user.id !== senderId)
      .map((room) =>
        this.messageStatusRepository.create({
          message,
          user: room.user,
          status: MessageStatusEnum.SENT,
        }),
      );

    await this.messageStatusRepository.save(statuses);

    await this.roomRepository.update(room_id, {
      last_message: message,
    });

    const messageWithRelations = await this.messageRepository.findOne({
      where: { id: message.id },
      relations: ['sender', 'statuses'],
    });

    // Need to reconsider the implementation
    const messageResponse = plainToInstance(MessageResponseDto, messageWithRelations);
    messageResponse.is_user_message = true;

    if (messageResponse) this.messageGateway.sendMessageToRoom(room_id, messageResponse);

    const updatedRoom = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.last_message', 'last_message')
      .leftJoinAndSelect('last_message.sender', 'sender')
      .leftJoinAndSelect('room.room_user', 'room_user')
      .leftJoinAndSelect('room_user.user', 'user')
      .where('room.id = :room_id', { room_id })
      .getOne();

    const roomResponse = plainToInstance(RoomResponseDto, updatedRoom, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });

    if (updatedRoom) {
      const participantIds = roomResponse.participants
        .filter((user) => user.id !== senderId)
        .map((user) => user.id);

      this.messageGateway.notifyRoomUpdatedToUsers(participantIds, roomResponse);
    }

    return messageResponse;
  }

  public async getMessages(
    room_id: string,
    user_id: string,
    pagination: CursorPaginationQueryParamsDto,
  ): Promise<{ messages: MessageResponseDto[]; has_more: boolean; next_cursor: string | null }> {
    const { limit = 20, before } = pagination;

    const query = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoin('message.statuses', 'message_status', 'message_status.user.id = :user_id', {
        user_id,
      })
      .addSelect([
        'message_status.id',
        'message_status.status',
        'message_status.created_at',
        'message_status.updated_at',
        'message_status.read_at',
      ])
      .where('message.room.id = :room_id', { room_id })
      .orderBy('message.created_at', 'DESC')
      .take(limit + 1);

    if (before) query.andWhere('message.created_at < :before', { before: new Date(before) });

    const queryResults = await query.getMany();

    const hasMore = queryResults.length > limit;
    const items = hasMore ? queryResults.slice(0, limit) : queryResults;
    const nextCursor = hasMore ? items[items.length - 1].created_at.toISOString() : null;

    const messages = items.map((message) => {
      const status = message.statuses?.[0] ?? null;
      return plainToInstance(
        MessageResponseDto,
        {
          id: message.id,
          content: message.content,
          sender: message.sender,
          status,
          is_user_message: message.sender.id === user_id,
          created_at: message.created_at,
        },
        { exposeDefaultValues: true },
      );
    });

    return { messages, has_more: hasMore, next_cursor: nextCursor };
  }
}
