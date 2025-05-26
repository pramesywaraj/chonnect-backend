import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export default class CreateMessageRequestDto {
  @IsUUID()
  @IsNotEmpty()
  room_id: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
