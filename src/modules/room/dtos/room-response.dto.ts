import { Expose, Type } from 'class-transformer';

import RoomParticipantDto from './room-participant.dto';
import { MessageResponseDto } from '../../../modules/message/dtos';

export default class RoomResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  is_group: boolean;

  @Expose()
  created_at: Date;

  @Expose({ name: 'room_user' })
  @Type(() => RoomParticipantDto)
  participants: RoomParticipantDto[];

  @Expose()
  @Type(() => MessageResponseDto)
  last_message: MessageResponseDto;
}
