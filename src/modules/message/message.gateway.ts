import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { type Socket, type Server } from 'socket.io';

import { MESSAGE_SOCKET, ROOM_SOCKET, GENERAL_SOCKET } from '../../enums/socket.enum';
import { MessageResponseDto } from './dtos';
import { RoomResponseDto } from '../room/dtos';
import { MessageStatusService } from './message-status.service';
import AuthService from '../auth/auth.service';

interface AuthenticatedSocket extends Socket {
  data: {
    userId?: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly messageStatusService: MessageStatusService,
    private readonly authService: AuthService,
  ) {}
  @WebSocketServer()
  server: Server;

  handleConnection(client: AuthenticatedSocket) {
    const token = (client.handshake?.auth?.token ||
      client.handshake?.headers?.authorization?.split(' ')[1]) as string;

    try {
      const payload = this.authService.verifyAccessToken(token);
      client.data.userId = payload.sub;

      console.log('Client connected:', client.id, client.data.userId);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(ROOM_SOCKET.ROOM_JOIN)
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() roomId: string,
  ) {
    await client.join(roomId);
    console.log(`Client ${client.id} joined room: ${roomId}`, client.data.userId);
  }

  @SubscribeMessage(ROOM_SOCKET.ROOM_LEAVE)
  async handleLeaveRoom(client: AuthenticatedSocket, roomId: string) {
    await client.leave(roomId);
    console.log(`Client ${client.id} leave room: ${roomId}`);
  }

  @SubscribeMessage(GENERAL_SOCKET.USER_SUBSCRIBE_TO_SERVER)
  async handleSubscribeToServer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() userId: string,
  ) {
    await client.join(`user_${userId}`);
    console.log(`User ${userId} subscribed to the server`);
  }

  @SubscribeMessage(GENERAL_SOCKET.USER_UNSUBSCRIBE_FROM_SERVER)
  async handleUnsubscribeFromServer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() userId: string,
  ) {
    await client.leave(`user_${userId}`);
    console.log(`User ${userId} unsubscribed from the server`);
  }

  sendMessageToRoom(roomId: string, message: MessageResponseDto) {
    this.server.to(roomId).emit(MESSAGE_SOCKET.NEW_MESSAGE, message);
  }

  notifyRoomUpdatedToUsers(userIds: string[], room: RoomResponseDto) {
    userIds.forEach((uid) => {
      this.server.to(`user_${uid}`).emit(ROOM_SOCKET.ROOM_UPDATED, room);
    });
  }

  // Change message status //

  // to make all saved new messages mark as delivered, use when
  // use when user connected to the server
  @SubscribeMessage(MESSAGE_SOCKET.MARK_ALL_DELIVERED)
  async handleMarkAllDelivered(@ConnectedSocket() client: AuthenticatedSocket) {
    const userId = client.data?.userId;

    if (!userId) return;

    await this.messageStatusService.markAllAsDeliveredForUser(userId);
    console.log(`All messages marked as delivered for user: ${userId}`);
  }

  @SubscribeMessage(MESSAGE_SOCKET.MARK_DELIVERED)
  async handleMessageAsDelivered(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() message_id: string,
  ) {
    const user_id = client.data?.userId;

    if (!user_id || !message_id) return;

    await this.messageStatusService.markMessageAsDelivered({ user_id, message_id });
  }
}
