import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoomUser } from './room-user.entity';
import { Message } from './message.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  name: string | null;

  @Column({ default: false })
  is_group: boolean;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => RoomUser, (roomUser) => roomUser.room)
  room_user: RoomUser[];

  @OneToMany(() => Message, (message) => message.room)
  messages: Message[];

  @ManyToOne(() => Message, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn()
  last_message: Message;
}
