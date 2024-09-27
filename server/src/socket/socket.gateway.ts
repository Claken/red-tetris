import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { WaitGame } from '../../class/waitGame/waitGame';
import { SocketService } from './socket.service';
import { ManageSocket } from '../../class/manageSocket/manageSocket';

// import { Logger } from '@nestjs/common';

// (uuid + name) associer a une socketId

// {cors: '*'} pour dire qu'on accepte tout le monde
@WebSocketGateway({ cors: '*' }) // decorator pour dire que la classe ChatGateway sera un gateway /
export class SocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server: Server;
  private waitGame: WaitGame;
  private manageSocket: ManageSocket = ManageSocket.getInstance();

  constructor(private readonly socketService: SocketService) {}
  afterInit(): void {
    this.waitGame = WaitGame.getInstance(this.server);
  }

  private listenToEmmitter(socket: Socket) {
    socket.on('playerPlayMulti', (data) => {
      console.log(data);
      const infos = this.manageSocket.getInfos(data.uuid);
      if (infos == undefined) {
        return;
      }
      this.waitGame.addPlayer(data.uuid, infos.name, socket.id);
    });
  }

  handleConnection(socket: Socket): void {
    this.socketService.handleConnection(socket);
    const name = socket.handshake.query.name as string | undefined;
    const uuid = socket.handshake.query.uuid as string | undefined;
    if (name == undefined || typeof name != 'string') {
      return;
    }
    this.manageSocket.add(socket, name, uuid);
    this.listenToEmmitter(socket);
  }

  handleDisconnect(socket: Socket): void {
    console.log('Client disconnected');
    this.manageSocket.deleteSocket(socket);
  }
  // Implement other Socket.IO event handlers and message handlers
}
