import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoomUser } from './room-user.entity';
import { Message } from './message.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ type: 'varchar', length: 30 })
  @Expose()
  name: string;

  @Column({ type: 'varchar', length: 40 })
  @Expose()
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ nullable: true, type: 'varchar' })
  @Expose()
  profile_image: string;

  @CreateDateColumn()
  @Expose()
  created_at: Date;

  @UpdateDateColumn()
  @Expose()
  updated_at: Date;

  @OneToMany(() => RoomUser, (roomUser) => roomUser.user)
  userRooms: RoomUser[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];
}
