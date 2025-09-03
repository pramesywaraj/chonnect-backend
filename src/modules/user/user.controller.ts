import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Request,
  SerializeOptions,
  UseInterceptors,
  Query,
} from '@nestjs/common';

import UserService from './user.service';
import { AuthRequest } from '../../types/auth.type';
import { SuccessMessage } from 'src/common/decorators';
import { SearchUserQueryParams } from './dtos';

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
export default class UserController {
  constructor(private readonly userService: UserService) {}

  @SuccessMessage('Users has been fetched')
  @Get('all')
  getUsers(@Request() req: AuthRequest, @Query() searchParams: SearchUserQueryParams) {
    const currentUserId = req.user.sub;
    return this.userService.getUsers(searchParams, currentUserId);
  }

  @SuccessMessage('User profile fetched successfully')
  @Get('profile')
  getProfile(@Request() req: AuthRequest, @Query('userId') userId: string) {
    const currentUserId = req.user.sub;

    return this.userService.findOneById(userId ? userId : currentUserId);
  }

  @SuccessMessage('This user profile fetched successfully')
  @Get(':userId')
  getUserProfile(@Query('userId') userId: string) {
    return this.userService.findOneById(userId);
  }
}
