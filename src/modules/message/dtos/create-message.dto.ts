import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export default class CreateMessageDto {
  @IsUUID()
  @IsNotEmpty()
  room_id: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
