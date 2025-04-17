import { Expose } from 'class-transformer';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RoomUser } from './room-user.entity';
import { Message } from './message.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column()
  name: string;

  @Column({ default: false })
  is_group: boolean;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => RoomUser, (roomUser) => roomUser.room)
  users: RoomUser[];

  @OneToMany(() => Message, (message) => message.room)
  messages: Message[];
}
