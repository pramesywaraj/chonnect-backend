import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';
import { MessageStatusEnum } from 'src/enums/message.enum';
import { Expose } from 'class-transformer';

@Entity('message_status')
@Unique(['message', 'user'])
export class MessageStatus {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @ManyToOne(() => Message, (message) => message.statuses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  @Expose()
  message: Message;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Expose()
  user: User;

  @Column({ type: 'enum', enum: MessageStatusEnum, default: MessageStatusEnum.SENT })
  @Expose()
  status: MessageStatusEnum;

  @Column({ type: 'timestamp', nullable: true })
  @Expose()
  read_at: Date | null;

  @CreateDateColumn()
  @Expose()
  created_at: Date;

  @UpdateDateColumn()
  @Expose()
  updated_at: Date;
}
