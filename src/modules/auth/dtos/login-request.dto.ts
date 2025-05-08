import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export default class LoginRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
