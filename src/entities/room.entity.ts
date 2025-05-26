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
  @Expose()
  name: string | null;

  @Column({ default: false })
  @Expose()
  is_group: boolean;

  @CreateDateColumn()
  @Expose()
  created_at: Date;

  @OneToMany(() => RoomUser, (roomUser) => roomUser.room)
  @Expose({ name: 'participants' })
  room_user: RoomUser[];

  @OneToMany(() => Message, (message) => message.room)
  @Expose()
  messages: Message[];

  @ManyToOne(() => Message, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'last_message_id' })
  @Expose()
  last_message: Message;
}
