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
    socket.on('playerAlone', (data) => {
      console.log(data);
      const infos = this.manageSocket.getInfos(data.uuid);
      if (infos == undefined) {
        return;
      }
      // this.waitGame.addPlayer(data.uuid, infos.name, socket.id);
    });
    socket.on('playerPlayMulti', (data) => {
      // console.log(data);
      const infos = this.manageSocket.getInfos(data.uuid);
      if (infos == undefined) {
        return;
      }
      this.waitGame.addPlayer(data.uuid, infos.name, socket.id);
    });
    socket.on('moveRight', (data) => {
      // console.log('move right');
      // console.log(data);
      const games = this.waitGame.getGames();
      const game = games.get(data.roomId);
      if (game == undefined) {
        return;
      }
      // console.log('moove right');
      game.moveRight(data.uuid);
    });
    socket.on('moveLeft', (data) => {
      const games = this.waitGame.getGames();
      const game = games.get(data.roomId);
      if (game == undefined) {
        return;
      }
      game.moveLeft(data.uuid);
    });
    socket.on('rotate', (data) => {
      const games = this.waitGame.getGames();
      const game = games.get(data.roomId);
      if (game == undefined) {
        return;
      }
      game.rotate(data.uuid);
    });

    socket.on('moveDown', (data) => {
      const games = this.waitGame.getGames();
      const game = games.get(data.roomId);
      if (game == undefined) {
        return;
      }
      game.moveDown(data.uuid);
    });

    socket.on('fallDown', (data) => {
      const games = this.waitGame.getGames();
      const game = games.get(data.roomId);
      if (game == undefined) {
        return;
      }
      game.fallDown(data.uuid);
    });

    socket.on('isInGame', (data) => {
      const uuid = data.uuid;
      const playerWaits = this.waitGame.getPlayerWaiting();
      if (playerWaits.length != 0) {
        const room = this.waitGame.getRoomName();
        socket.join(room);
      }
      // const infos = this.manageSocket.getInfos(uuid);
      // console.log({ infos: infos?.sockets });
      const rooms = this.waitGame.isInGame(uuid, socket.id);
      if (rooms == undefined) {
        return;
      }
      socket.join(rooms);
      const games = this.waitGame.getGames();
      const game = games.get(rooms[0]);
      if (game == undefined) {
        return;
      }
      game.sendCounterToClient();
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
    // console.log('Client disconnected');
    this.waitGame.deleteSocket(socket.id);
    this.manageSocket.deleteSocket(socket);
  }
  // Implement other Socket.IO event handlers and message handlers
}
