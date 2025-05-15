import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export default class CreateRoomDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Room name must be at least 3 characters' })
  @MaxLength(40, { message: 'Room name only available for 40 characters' })
  name?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @IsNotEmpty()
  participant_ids: string[];
}
