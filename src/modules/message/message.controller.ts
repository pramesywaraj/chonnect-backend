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
import { MarkMessagesAsRequest } from './dtos/message-status-request.dto';
import { MessageStatusService } from './message-status.service';

@Controller('message')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
export default class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly messageStatusService: MessageStatusService,
  ) {}

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

  @SuccessMessage('Messages marked as delivered')
  @Post('/status/mark-delivered')
  async markMessageAsDelivered(
    @Request() req: AuthRequest,
    @Body() markMessageAsDeliveredRequest: MarkMessagesAsRequest,
  ) {
    const user_id = req.user.sub;

    await this.messageStatusService.markMessagesAsDelivered({
      message_ids: markMessageAsDeliveredRequest.message_ids,
      user_id,
    });

    return null;
  }

  @SuccessMessage('Messages marked as readed')
  @Post('/status/mark-read')
  async markMessagesAsRead(
    @Request() req: AuthRequest,
    @Body() markMessagesAsReadRequest: MarkMessagesAsRequest,
  ) {
    const user_id = req.user.sub;

    await this.messageStatusService.markMessagesAsDelivered({
      message_ids: markMessagesAsReadRequest.message_ids,
      user_id,
    });

    return null;
  }
}
