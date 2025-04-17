import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Room } from './room.entity';
import { User } from './user.entity';

@Entity('room_users')
@Unique(['room', 'user']) // to prevent duplicate over room and user
export class RoomUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Room, (room) => room.users, { onDelete: 'CASCADE' })
  room: Room;

  @ManyToOne(() => User, (user) => user.userRooms, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  joined_at: Date;
}
