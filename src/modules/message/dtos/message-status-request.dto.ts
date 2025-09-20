import { IsArray, IsNotEmpty } from 'class-validator';

export class MarkMessagesAsRequest {
  @IsArray()
  @IsNotEmpty()
  message_ids: string[];
}
