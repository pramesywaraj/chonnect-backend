import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import AuthService from './auth.service';
import { User } from '../../entities/user.entity';

import { CreateUserDto } from '../user/dtos/create-user.dto';

import { LoginResponse } from './responses/login.response';
import { LocalAuthGuard } from './guards';
import { AuthUser } from './decorators/auth-user.decorator';

@Controller('auth')
export default class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    const user = await this.authService.register(createUserDto);
    return user;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@AuthUser() user: User): Promise<LoginResponse> {
    const tokens = await this.authService.login(user);

    return new LoginResponse({ ...tokens });
  }
}
