import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

import { MessageStatus } from 'src/entities';
import { MessageStatusEnum } from 'src/enums/message.enum';

import type {
  ChangeMessagesAsParams,
  ChangeStatusMarkAsParams,
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

  async markMessagesAsDelivered(params: ChangeMessagesAsParams) {
    const { message_ids, user_id } = params;

    return this.messageStatusRepository
      .createQueryBuilder()
      .update(MessageStatus)
      .set({ status: MessageStatusEnum.DELIVERED })
      .where('user_id = :user_id', { user_id })
      .andWhere('message_id IN (:...message_ids)', { message_ids })
      .andWhere('status = :status', { status: MessageStatusEnum.SENT })
      .execute();
  }

  async markMessagesAsRead(params: ChangeMessagesAsParams) {
    const { message_ids, user_id } = params;

    return this.messageStatusRepository
      .createQueryBuilder()
      .update(MessageStatus)
      .set({ status: MessageStatusEnum.READ })
      .where('user_id = :user_id', { user_id })
      .andWhere('message_id IN (:...message_ids)', { message_ids })
      .andWhere('status = :status', { status: MessageStatusEnum.DELIVERED })
      .execute();
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
}
