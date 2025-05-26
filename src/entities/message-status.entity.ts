import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';
import { MessageStatusEnum } from 'src/enums/message.enum';
import { Expose } from 'class-transformer';

@Entity('message_status')
@Unique(['message', 'sender'])
export class MessageStatus {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @ManyToOne(() => Message, (message) => message.statuses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  @Expose()
  message: Message;

  @ManyToOne(() => User, (user) => user.message_status, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  @Expose()
  sender: User;

  @Column({ type: 'enum', enum: MessageStatusEnum, default: MessageStatusEnum.SENT })
  @Expose()
  status: MessageStatusEnum;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Expose()
  read_at: Date;
}
