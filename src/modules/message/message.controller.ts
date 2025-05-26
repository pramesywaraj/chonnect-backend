import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Request,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';

import MessageService from './message.service';

import { Message } from '../../entities';
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
  ): Promise<Message> {
    const userId = req.user.sub;

    return this.messageService.sendMessage(userId, createMessageRequestDto);
  }

  @Get('/room/:roomId')
  async getMessageOnRoom(@Param('roomId') roomId: string): Promise<MessageResponseDto[]> {
    const messages = await this.messageService.getMessages(roomId);

    return messages.map((message) => plainToInstance(MessageResponseDto, message));
  }
}
