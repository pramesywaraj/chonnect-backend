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
  @WebSocketServer()
  server: Server;

  handleConnection(client: AuthenticatedSocket) {
    console.log('Client connected:', client.id);
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
    console.log(`Client ${client.id} joined room: ${roomId}`);
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
}
