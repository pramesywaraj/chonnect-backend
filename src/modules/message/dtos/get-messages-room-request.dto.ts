import { IsOptional, IsString } from 'class-validator';

export default class GetMessagesRoomRequestDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  limit?: string;
}
