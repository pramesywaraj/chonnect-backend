import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Expose } from 'class-transformer';

import { Room } from './room.entity';
import { User } from './user.entity';
import { UserRoles } from '../modules/user/enums/role.enum';

@Entity('room_users')
@Unique(['room', 'user']) // to prevent duplicate over room and user
export class RoomUser {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @ManyToOne(() => Room, (room) => room.room_user, { onDelete: 'CASCADE' })
  @Expose()
  room: Room;

  @ManyToOne(() => User, (user) => user.room_user, { onDelete: 'CASCADE' })
  @Expose()
  user: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Expose()
  joined_at: Date;

  @Column({ type: 'enum', enum: UserRoles, default: UserRoles.MEMBER })
  @Expose()
  role: UserRoles;
}
