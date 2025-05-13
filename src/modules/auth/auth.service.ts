import { HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import UserService from '../user/user.service';
import PasswordService from '../user/password.service';

import { User } from '../../entities/user.entity';

import { throwHttpException } from '../../common/exceptions/utils';

import { CreateUserDto } from '../user/dtos/create-user.dto';
import { ConfigType } from '@nestjs/config';
import { refreshJwtConfig } from 'src/common/config/auth.config';
import { LoginResponse } from './responses/login.response';
import AuthJwtPayload from './types/jwt-payload.types';

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
    user: User,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload: AuthJwtPayload = { sub: user.id, email: user.email };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshJwtConfiguration),
    ]);

    return { access_token, refresh_token };
  }

  public async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new UnauthorizedException('User not found, please register the email first!');

    const isVerified = await this.passwordService.verify(password, user.password);
    if (!isVerified)
      throw new UnauthorizedException('Invalid password, please make sure again your password!');

    return user;
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
    const tokens = await this.generateTokens(user);

    return new LoginResponse(tokens);
  }
}
