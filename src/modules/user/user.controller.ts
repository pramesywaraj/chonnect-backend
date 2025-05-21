import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Request,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';

import UserService from './user.service';
import { AuthRequest } from '../../types/auth.type';
import { SuccessMessage } from 'src/common/decorators';

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
export default class UserController {
  constructor(private readonly userService: UserService) {}

  @SuccessMessage('User profile fetched successfully')
  @Get('profile')
  getProfile(@Request() req: AuthRequest) {
    return this.userService.findOneById(req.user.sub);
  }
}
