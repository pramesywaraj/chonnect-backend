import { HttpStatus, Injectable } from '@nestjs/common';
import UserService from '../user/user.service';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { throwHttpException } from 'src/common/exceptions/utils';

@Injectable()
export default class AuthService {
  constructor(private readonly userService: UserService) {}

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
}
