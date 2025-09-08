import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

interface AuthenticatedSocket extends Socket {
  data: {
    userId?: string;
  };
}

export class WsAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();
    const token = (client.handshake.auth?.token || client.handshake.query?.token) as
      | string
      | undefined;

    if (!token) {
      throw new WsException('Unauthorized: No token provided');
    }

    try {
      const payload = this.jwtService.verify<{ sub: string }>(token);
      client.data.userId = payload.sub;
      return true;
    } catch (error) {
      console.error('Error happened when guarding the WS', error);
      throw new WsException('Unauthorized: Invalid token');
    }
  }
}
