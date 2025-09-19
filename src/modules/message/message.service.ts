import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { MessageStatusService } from './message-status.service';
import { MessageGateway } from './message.gateway';

import { Message, Room, RoomUser, User } from '../../entities';
import { CreateMessageRequestDto, MessageResponseDto } from './dtos';
import { CursorPaginationQueryParamsDto } from '../../dto/pagination.dto';
import { RoomResponseDto } from '../room/dtos';

@Injectable()
export default class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomUser) private readonly roomUserRepository: Repository<RoomUser>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly messageGateway: MessageGateway,

    private readonly messageStatusService: MessageStatusService,
  ) {}

  public async sendMessage(sender_id: string, createMessageRequestDto: CreateMessageRequestDto) {
    const { content, room_id } = createMessageRequestDto;

    const room = await this.roomRepository.findOneBy({ id: room_id });
    if (!room) throw new NotFoundException('Room not found or available');

    const sender = await this.userRepository.findOneBy({ id: sender_id });
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

    // Create statuses for all participants except sender
    const participants = roomUsers.map((ru) => ru.user);
    await this.messageStatusService.createMessageStatus({
      message,
      participants,
      sender_id,
    });

    await this.roomRepository.update(room_id, {
      last_message: message,
    });

    const messageWithRelations = await this.messageRepository.findOne({
      where: { id: message.id },
      relations: ['sender', 'statuses', 'statuses.user'],
    });

    // Need to reconsider the implementation
    const messageResponse = plainToInstance(MessageResponseDto, messageWithRelations);
    messageResponse.is_user_message = true;

    if (messageResponse) this.messageGateway.sendMessageToRoom(room_id, messageResponse);

    const updatedRoom = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.last_message', 'last_message')
      .leftJoinAndSelect('last_message.sender', 'sender')
      .leftJoinAndSelect('last_message.statuses', 'message_status')
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
      .where('room.id = :room_id', { room_id })
      .getOne();

    if (updatedRoom) {
      const roomResponse = plainToInstance(RoomResponseDto, updatedRoom, {
        excludeExtraneousValues: true,
      });

      // // exclude the user that request the API
      const participantIds = roomResponse.participants
        .filter((user) => user.id !== sender_id)
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
      .leftJoin('message.statuses', 'message_status', 'message.sender_id = :user_id', {
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
      return plainToInstance(
        MessageResponseDto,
        {
          id: message.id,
          content: message.content,
          sender: message.sender,
          statuses: message.statuses ?? [],
          is_user_message: message.sender.id === user_id,
          created_at: message.created_at,
        },
        { exposeDefaultValues: true },
      );
    });

    return { messages, has_more: hasMore, next_cursor: nextCursor };
  }
}
