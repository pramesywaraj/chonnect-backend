import { Body, Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';

import AuthService from './auth.service';
import { User } from '../../entities/user.entity';

import { CreateUserDto } from '../user/dtos/create-user.dto';

import { LoginResponse, RefreshAccessResponse } from './responses';
import { LocalAuthGuard, RefreshJwtAuthGuard } from './guards';

import { AuthUser } from './decorators/auth-user.decorator';
import { Public } from './decorators/public.decorator';
import { SuccessMessage } from '../../common/decorators';

import { AuthRequest } from '../../types/auth.type';

@Controller('auth')
export default class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @SuccessMessage('User successfully registered')
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.authService.register(createUserDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @SuccessMessage('Welcome to Chonnect!')
  @Post('login')
  login(@AuthUser() user: User): Promise<LoginResponse> {
    return this.authService.login(user);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshJwtAuthGuard)
  @SuccessMessage('Token successfully refreshed')
  @Post('refresh')
  refresh(@Request() req: AuthRequest): Promise<RefreshAccessResponse> {
    return this.authService.refreshAccessToken(req.user.sub, req.user.email);
  }

  @HttpCode(HttpStatus.OK)
  @SuccessMessage('User has been successfully logged out, good bye')
  @Post('logout')
  logout(@Request() req: AuthRequest): Promise<void> {
    return this.authService.logout(req.user.sub);
  }
}
