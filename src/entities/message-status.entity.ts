import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';
import { MessageStatusEnum } from 'src/enums/message.enum';

@Entity('message_status')
@Unique(['message', 'sender'])
export class MessageStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Message, (message) => message.statuses, { onDelete: 'CASCADE' })
  message: Message;

  @ManyToOne(() => User, (user) => user.message_status, { onDelete: 'CASCADE' })
  sender: User;

  @Column({ type: 'enum', enum: MessageStatusEnum, default: MessageStatusEnum.SENT })
  status: MessageStatusEnum;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  read_at: Date;
}
