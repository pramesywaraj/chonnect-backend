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

export interface ChangeStatusMarkAsRoomParams {
  user_id: string;
  room_id: string;
}
