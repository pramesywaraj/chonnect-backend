import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Room } from './room.entity';
import { User } from './user.entity';
import { UserRoles } from '../modules/user/enums/role.enum';

@Entity('room_users')
@Unique(['room', 'user']) // to prevent duplicate over room and user
export class RoomUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Room, (room) => room.room_user, { onDelete: 'CASCADE' })
  room: Room;

  @ManyToOne(() => User, (user) => user.room_user, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joined_at: Date;

  @Column({ type: 'enum', enum: UserRoles, default: UserRoles.MEMBER })
  role: UserRoles;
}
