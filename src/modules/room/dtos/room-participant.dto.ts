import { Expose, Transform } from 'class-transformer';

import { RoomUser, User } from '../../../entities';
import { UserRoles } from '../../user/enums/role.enum';

interface RoomUserWithUser {
  obj: RoomUser & { user: User };
}

export default class RoomParticipantDto {
  @Transform(({ obj }: RoomUserWithUser) => obj.user.id)
  @Expose()
  id: string;

  @Transform(({ obj }: RoomUserWithUser) => obj.user.name)
  @Expose()
  name: string;

  @Transform(({ obj }: RoomUserWithUser) => obj.user.profile_image)
  @Expose()
  profile_image: string;

  @Expose()
  role: UserRoles;

  @Expose()
  joined_at: Date;
}
