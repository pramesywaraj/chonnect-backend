import { Expose, Transform, Type } from 'class-transformer';

import RoomParticipantDto from './room-participant.dto';
import { Message, Room } from '../../../entities';
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

  @Expose()
  @Transform(({ obj }: { obj: Room }) => {
    if (!obj.room_user) return [];

    return obj.room_user.map((room_user) => ({
      id: room_user.user.id,
      name: room_user.user.name,
      profile_image: room_user.user.profile_image,
      role: room_user.role,
      joined_at: room_user.joined_at,
    }));
  }) // Transform room_user ke participants
  participants: RoomParticipantDto[];

  @Expose()
  @Type(() => MessageResponseDto)
  last_message: Message;
}
