import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import UserService from '../user/user.service';
import PasswordService from '../user/password.service';

import { User } from '../../entities/user.entity';

import { throwHttpException } from '../../common/exceptions/utils';

import LoginRequestDto from './dtos/login-request.dto';
import { CreateUserDto } from '../user/dtos/create-user.dto';

@Injectable()
export default class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  private generateToken(user: User) {
    const payload = { user_id: user.id, email: user.email };
    return this.jwtService.sign(payload);
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

  public async login(loginRequestDto: LoginRequestDto): Promise<string> {
    const { email, password } = loginRequestDto;
    const user = await this.userService.findOneByEmail(email);

    if (!user) throw new UnauthorizedException('User not found, please register the email first!');

    const isPasswordVerified = await this.passwordService.verify(password, user.password);
    if (!isPasswordVerified)
      throw new UnauthorizedException('Invalid password, please make sure again your password!');

    return this.generateToken(user);
  }
}
