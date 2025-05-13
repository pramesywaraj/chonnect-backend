import { Controller, Get, Request } from '@nestjs/common';

import UserService from './user.service';
import { AuthRequest } from '../../types/auth.type';

@Controller('user')
export default class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  getProfile(@Request() req: AuthRequest) {
    return this.userService.findOneById(req.user.sub);
  }
}
