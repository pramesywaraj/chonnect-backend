import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Room } from './room.entity';
import { MessageStatus } from './message-status.entity';
import { Expose } from 'class-transformer';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ type: 'text' })
  @Expose()
  content: string;

  @ManyToOne(() => User, (user) => user.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  @Expose()
  sender: User;

  @ManyToOne(() => Room, (room) => room.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  @Expose()
  room: Room;

  @OneToMany(() => MessageStatus, (status) => status.message)
  @Expose()
  statuses: MessageStatus[];

  @CreateDateColumn()
  @Expose()
  created_at: Date;
}
