import { Expose, Type } from 'class-transformer';

import { User } from '../../../entities';
import { MessageStatusEnum } from 'src/enums/message.enum';

class MessageSenderDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  profile_image: string;
}

export class MessageStatusDto {
  @Expose({ name: 'status' })
  name: MessageStatusEnum;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;

  @Expose()
  read_at: Date;
}

export default class MessageResponseDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  @Type(() => MessageSenderDto)
  sender: User;

  @Expose()
  @Type(() => MessageStatusDto)
  statuses: MessageStatusDto[];

  @Expose()
  is_user_message: boolean;

  @Expose()
  created_at: Date;
}
