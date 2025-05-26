import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Message, MessageStatus, Room, RoomUser, User } from '../../entities';
import { CreateMessageRequestDto } from './dtos';

import { MessageStatusEnum } from '../../enums/message.enum';

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

    return message;
  }

  public async getMessages(roomId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { room: { id: roomId } },
      relations: ['sender', 'statuses'],
      order: { created_at: 'ASC' },
    });
  }
}
