import { WebSocketGateway, OnGatewayConnection, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { Logger } from '@nestjs/common';

// {cors: '*'} pour dire qu'on accepte tout le monde
@WebSocketGateway({cors: '*'})  // decorator pour dire que la classe ChatGateway sera un gateway /
export class SocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server: Socket;

  constructor(private readonly socketService: SocketService) {}

  handleConnection(socket: Socket): void {
    this.socketService.handleConnection(socket);

  }

  // Implement other Socket.IO event handlers and message handlers
}
