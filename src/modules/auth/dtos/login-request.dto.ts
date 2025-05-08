import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export default class LoginRequestDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter a valid email' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}
