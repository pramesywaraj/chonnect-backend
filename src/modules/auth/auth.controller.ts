import { Body, Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';

import AuthService from './auth.service';
import { User } from '../../entities/user.entity';

import { CreateUserDto } from '../user/dtos/create-user.dto';

import { LoginResponse } from './responses/login.response';
import { LocalAuthGuard } from './guards';
import { AuthUser } from './decorators/auth-user.decorator';
import RefreshJwtAuthGuard from './guards/refresh-jwt-auth.guard';
import { RefreshAccessResponse } from './responses/refresh-access.response';
import { Public } from './decorators/public.decorator';
import { AuthRequest } from '../../types/auth.type';
import DefaultResponse from '../../common/responses/default.response';

@Controller('auth')
export default class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    const user = await this.authService.register(createUserDto);
    return user;
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@AuthUser() user: User): Promise<LoginResponse> {
    const tokens = await this.authService.login(user);

    return new LoginResponse({ ...tokens });
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  refresh(@Request() req: AuthRequest): Promise<RefreshAccessResponse> {
    return this.authService.refreshAccessToken(req.user.sub, req.user.email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Request() req: AuthRequest): Promise<DefaultResponse> {
    await this.authService.logout(req.user.sub);

    return new DefaultResponse({
      status_code: HttpStatus.OK,
      message: 'User has been successfully logged out',
    });
  }
}
