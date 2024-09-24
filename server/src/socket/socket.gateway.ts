import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { WaitGame } from '../../class/waitGame/waitGame';
import { SocketService } from './socket.service';
// import { Logger } from '@nestjs/common';

// (uuid + name) associer a une socketId

// {cors: '*'} pour dire qu'on accepte tout le monde
@WebSocketGateway({ cors: '*' }) // decorator pour dire que la classe ChatGateway sera un gateway /
export class SocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server: Server;
  private waitGame: WaitGame;

  // private waiterGame: WaitGame = WaitGame.getInstance();
  // private games: Map<string, Game> = new Map(); // Map pour stocker les games, avec comme clé le room_id
  // private identifierToSockets: Map<IdentifierToSocket, string[]> = new Map(); // Map pour stocker les sockets, avec comme clé le name et l'uuid
  // private socketsToIdRoom: Map<string, string> = new Map(); // Map pour stocker les sockets, avec comme clé le socketId et le room_id
  constructor(private readonly socketService: SocketService) {
    this.waitGame = WaitGame.getInstance(this.server);
  }

  handleConnection(socket: Socket): void {
    this.socketService.handleConnection(socket);
  }

  // Implement other Socket.IO event handlers and message handlers
}
