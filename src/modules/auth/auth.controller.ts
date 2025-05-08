import { Body, Controller, Post } from '@nestjs/common';

import AuthService from './auth.service';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { User } from '../../entities/user.entity';
import LoginRequestDto from './dtos/login-request.dto';
import { LoginResponse } from './responses/login.response';

@Controller('auth')
export default class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    const user = await this.authService.register(createUserDto);
    return user;
  }

  @Post('login')
  async login(@Body() loginRequestDto: LoginRequestDto): Promise<LoginResponse> {
    const accessToken = await this.authService.login(loginRequestDto);

    return new LoginResponse({ access_token: accessToken });
  }
}
