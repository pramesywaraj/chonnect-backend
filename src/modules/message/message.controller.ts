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
import { plainToInstance } from 'class-transformer';

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
    @Param('roomId') roomId: string,
    @Query() pagination: CursorPaginationQueryParamsDto,
  ): Promise<CursorPaginationDto<MessageResponseDto>> {
    const userId = req.user.sub;
    const { messages, has_more } = await this.messageService.getMessages(roomId, pagination);

    const data = messages.map((message) => {
      const result = plainToInstance(MessageResponseDto, message);
      result.is_user_message = message.sender.id === userId;

      return result;
    });

    return new CursorPaginationDto(data, has_more);
  }
}
