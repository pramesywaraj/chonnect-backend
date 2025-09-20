import { Message, User } from 'src/entities';

export interface CreateMessageStatusesParams {
  message: Message;
  participants: User[];
  sender_id: string;
}

export interface ChangeStatusMarkAsParams {
  message_id: string;
  user_id: string;
}

export interface ChangeMessagesAsParams {
  message_ids: string[];
  user_id: string;
}
