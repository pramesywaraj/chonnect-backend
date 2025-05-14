import { HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import * as argon2 from 'argon2';

import UserService from '../user/user.service';
import PasswordService from '../user/password.service';

import { User } from '../../entities/user.entity';

import { throwHttpException } from '../../common/exceptions/utils';

import { CreateUserDto } from '../user/dtos/create-user.dto';
import { refreshJwtConfig } from 'src/common/config/auth.config';
import { LoginResponse } from './responses/login.response';
import { RefreshAccessResponse } from './responses/refresh-access.response';
import { AuthJwtPayload } from '../../types/auth.type';

@Injectable()
export default class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,

    @Inject(refreshJwtConfig.KEY)
    private readonly refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
  ) {}

  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload: AuthJwtPayload = { sub: userId, email };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshJwtConfiguration),
    ]);

    return { access_token, refresh_token };
  }

  public async refreshAccessToken(userId: string, email: string): Promise<RefreshAccessResponse> {
    const tokens = await this.generateTokens(userId, email);
    const hashedRefreshToken = await argon2.hash(tokens.refresh_token);

    await this.userService.updateRefreshToken(userId, hashedRefreshToken);

    return new LoginResponse(tokens);
  }

  public async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new UnauthorizedException('User not found, please register the email first!');

    const isVerified = await this.passwordService.verify(password, user.password);
    if (!isVerified)
      throw new UnauthorizedException('Invalid password, please make sure again your password!');

    return user;
  }

  public async validateRefreshToken(userId: string, refreshToken: string): Promise<AuthJwtPayload> {
    const user = await this.userService.findOneById(userId);
    if (!user || !user.refresh_token) throw new UnauthorizedException('Invalid refresh token!');

    const isRefreshTokenMatch = await argon2.verify(user.refresh_token, refreshToken);
    if (!isRefreshTokenMatch) throw new UnauthorizedException('Invalid refresh token!');

    return { sub: user.id, email: user.email };
  }

  public async register(createUserDto: CreateUserDto): Promise<User> {
    const isUserExisted = await this.userService.findOneByEmail(createUserDto.email);

    if (isUserExisted) {
      const message = 'User already registered with this email.';
      throwHttpException({
        status: HttpStatus.CONFLICT,
        title: 'Registration Failed',
        detail: message,
        errors: [{ message }],
      });
    }

    const user = await this.userService.createUser(createUserDto);

    return user;
  }

  public async login(user: User): Promise<LoginResponse> {
    const tokens = await this.generateTokens(user.id, user.email);
    const hashedRefreshToken = await argon2.hash(tokens.refresh_token);

    await this.userService.updateRefreshToken(user.id, hashedRefreshToken);

    return new LoginResponse(tokens);
  }

  public async logout(userId: string): Promise<void> {
    await this.userService.updateRefreshToken(userId, null);
  }
}
