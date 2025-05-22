import { Expose, Transform, Type } from 'class-transformer';

import RoomParticipantDto from './room-participant.dto';
import { Room } from '../../../entities';

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
  @Transform(({ obj }: { obj: Room }) => obj.room_user)
  @Type(() => RoomParticipantDto)
  participants: RoomParticipantDto[];
}
