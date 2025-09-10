import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';

import MessageService from './message.service';

import { CursorPaginationDto, CursorPaginationQueryParamsDto } from '../../dto/pagination.dto';
import { CreateMessageRequestDto, MessageResponseDto } from './dtos';

import { AuthRequest } from '../../types/auth.type';
import { SuccessMessage } from '../../common/decorators';

@Controller('message')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
export default class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @SuccessMessage('Message has been sent')
  @Post()
  async sendMessage(
    @Request() req: AuthRequest,
    @Body() createMessageRequestDto: CreateMessageRequestDto,
  ): Promise<MessageResponseDto> {
    const userId = req.user.sub;

    return this.messageService.sendMessage(userId, createMessageRequestDto);
  }

  @Get('/room/:roomId')
  async getMessageOnRoom(
    @Request() req: AuthRequest,
    @Param('roomId') room_id: string,
    @Query() pagination: CursorPaginationQueryParamsDto,
  ): Promise<CursorPaginationDto<MessageResponseDto>> {
    const user_id = req.user.sub;

    const { messages, has_more, next_cursor } = await this.messageService.getMessages(
      room_id,
      user_id,
      pagination,
    );

    return new CursorPaginationDto(messages, has_more, next_cursor);
  }
}
