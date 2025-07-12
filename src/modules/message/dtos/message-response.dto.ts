import { Expose, Transform, Type } from 'class-transformer';

import { MessageStatus, User } from '../../../entities';
import { MessageStatusEnum } from 'src/enums/message.enum';

class MessageSenderDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  profile_image: string;
}

class MessageStatusDto {
  @Expose()
  @Transform(({ obj }: { obj: MessageStatus }) => obj.status)
  name: MessageStatusEnum;
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
  statuses: MessageStatus[];

  @Expose()
  is_user_message: boolean;

  @Expose()
  created_at: Date;
}
