import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

import { MessageStatus } from 'src/entities';
import { MessageStatusEnum } from 'src/enums/message.enum';

import type {
  ChangeStatusMarkAsParams,
  ChangeStatusMarkAsRoomParams,
  CreateMessageStatusesParams,
} from './types/message-status.type';

@Injectable()
export class MessageStatusService {
  constructor(
    @InjectRepository(MessageStatus)
    private readonly messageStatusRepository: Repository<MessageStatus>,
  ) {}

  async createMessageStatus(params: CreateMessageStatusesParams) {
    const { message, participants, sender_id } = params;

    const statuses = participants
      .filter((user) => user.id !== sender_id)
      .map((user) =>
        this.messageStatusRepository.create({
          message,
          user,
          status: MessageStatusEnum.SENT,
        }),
      );

    return this.messageStatusRepository.save(statuses);
  }

  async markMessageAsDelivered(params: ChangeStatusMarkAsParams) {
    const { message_id, user_id } = params;

    return this.messageStatusRepository.update(
      { message: { id: message_id }, user: { id: user_id }, status: MessageStatusEnum.SENT },
      { status: MessageStatusEnum.DELIVERED },
    );
  }

  async markMessageAsRead(params: ChangeStatusMarkAsParams) {
    const { message_id, user_id } = params;

    return this.messageStatusRepository.update(
      { message: { id: message_id }, user: { id: user_id }, status: MessageStatusEnum.DELIVERED },
      { status: MessageStatusEnum.READ, read_at: new Date() },
    );
  }

  async markAllAsDeliveredForUser(user_id: string) {
    return this.messageStatusRepository
      .createQueryBuilder()
      .update(MessageStatus)
      .set({ status: MessageStatusEnum.DELIVERED })
      .where('user_id = :user_id', { user_id })
      .andWhere('status = :status', { status: MessageStatusEnum.SENT })
      .execute();
  }

  async markRoomMessagesAsDelivered(params: ChangeStatusMarkAsRoomParams) {
    const { user_id, room_id } = params;

    return this.messageStatusRepository
      .createQueryBuilder('message_status')
      .innerJoin('message_status.message', 'message')
      .update()
      .set({ status: MessageStatusEnum.DELIVERED })
      .where('message.user_id = :user_id', { user_id })
      .andWhere('message.status = :status', { status: MessageStatusEnum.SENT })
      .andWhere('message.room_id = :room_id', { room_id })
      .execute();
  }

  async markRoomMessagesAsRead(params: ChangeStatusMarkAsRoomParams) {
    const { user_id, room_id } = params;

    return this.messageStatusRepository
      .createQueryBuilder('message_status')
      .innerJoin('message_status.message', 'message')
      .update()
      .set({ status: MessageStatusEnum.READ, read_at: () => 'NOW()' })
      .where('message.user_id = :user_id', { user_id })
      .andWhere('message.status IN (:...status)', {
        status: [MessageStatusEnum.SENT, MessageStatusEnum.DELIVERED],
      })
      .andWhere('message.room_id = :room_id', { room_id })
      .execute();
  }
}
