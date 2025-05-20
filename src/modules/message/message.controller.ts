import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import MessageService from './message.service';
import { Message } from '../../entities';
import { AuthRequest } from 'src/types/auth.type';
import CreateMessageDto from './dtos/create-message.dto';
import { SuccessMessage } from 'src/common/decorators';

@Controller('message')
export default class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @SuccessMessage('Message has been sent')
  @Post()
  async sendMessage(
    @Request() req: AuthRequest,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    const userId = req.user.sub;

    return this.messageService.sendMessage(userId, createMessageDto);
  }

  @Get('/room/:roomId')
  async getMessageOnRoom(@Param('roomId') roomId: string): Promise<Message[]> {
    return this.messageService.getMessages(roomId);
  }
}
