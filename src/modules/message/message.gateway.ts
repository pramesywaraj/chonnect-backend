import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { type Socket, type Server } from 'socket.io';

import { MESSAGE_SOCKET, ROOM_SOCKET } from '../../enums/socket.enum';
import { MessageResponseDto } from './dtos';
import { Room } from 'src/entities';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(ROOM_SOCKET.ROOM_JOIN)
  handleJoinRoom(client: Socket, roomId: string) {
    client.join(roomId);
    console.log(`Client ${client.id} joined room: ${roomId}`);
  }

  @SubscribeMessage(ROOM_SOCKET.ROOM_LEAVE)
  handleLeaveRoom(client: Socket, roomId: string) {
    client.leave(roomId);
    console.log(`Client ${client.id} leave room: ${roomId}`);
  }

  sendMessageToRoom(roomId: string, message: MessageResponseDto) {
    this.server.to(roomId).emit(MESSAGE_SOCKET.NEW_MESSAGE, message);
  }

  updateRoomLastMessage(roomId: string, message: Room) {
    this.server.to(roomId).emit(ROOM_SOCKET.ROOM_LAST_MESSAGE_UPDATE, message);
  }
}
