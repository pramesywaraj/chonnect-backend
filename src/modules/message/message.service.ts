import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, type FindOptionsWhere, type Repository } from 'typeorm';

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
          sender: room.user,
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

    if (messageResponse) this.messageGateway.sendMessageToRoom(room_id, messageResponse);

    const updatedRoom = await this.roomRepository.findOne({
      where: { id: room_id },
      relations: ['last_message', 'last_message.sender'],
    });

    const roomResponse = plainToInstance(RoomResponseDto, updatedRoom);

    if (updatedRoom) this.messageGateway.updateRoomLastMessage(room_id, roomResponse);

    return message;
  }

  public async getMessages(
    roomId: string,
    pagination: CursorPaginationQueryParamsDto,
  ): Promise<{ messages: Message[]; has_more: boolean }> {
    const { limit = 20, before } = pagination;
    const where: FindOptionsWhere<Message> = { room: { id: roomId } };

    if (before) {
      where.created_at = LessThan(new Date(before));
    }

    const messages = await this.messageRepository.find({
      where,
      relations: ['sender', 'statuses'],
      order: { created_at: 'DESC' },
      take: limit + 1,
    });

    const hasMore = messages.length > limit;
    const paginatedMessages = hasMore ? messages.slice(0, limit) : messages;

    return { messages: paginatedMessages, has_more: hasMore };
  }
}
