import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { WaitGame } from '../../class/waitGame/waitGame';
import { SocketService } from './socket.service';
import { ManageSocket } from '../../class/manageSocket/manageSocket';
import { ClientInfo } from '../../interfaces/clientInfo';
import { SINGLE, MULTI } from '../../constantes/constantes';

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
    console.log(socket.id);
    socket.on('startSingleTetrisGame', (data) => {
      // console.log(data);
      const infos = this.manageSocket.getInfos(data.uuid);
      if (infos == undefined) {
        return;
      }
      this.waitGame.startSingleTetrisGame(data.uuid, infos.name, socket.id);
    });
    // socket.on('playerPlayMulti', (data) => {
    //   // console.log(data);
    //   const infos = this.manageSocket.getInfos(data.uuid);
    //   if (infos == undefined) {
    //     return;
    //   }
    //   this.waitGame.addPlayer(data.uuid, infos.name, socket.id, false);
    // });
    socket.on('moveRight', (data) => {
      const infos: ClientInfo | undefined = this.waitGame
        .getUUIDMapings()
        .get(data.uuid);
      if (infos == undefined) return;
      const games = this.waitGame.getGames();
      const game = games.get(data.roomId);
      if (game == undefined) return;
      game.moveRight(data.uuid, infos.socketsId);
    });
    socket.on('moveLeft', (data) => {
      const infos: ClientInfo | undefined = this.waitGame
        .getUUIDMapings()
        .get(data.uuid);
      if (infos == undefined) return;
      const games = this.waitGame.getGames();
      const game = games.get(data.roomId);
      if (game == undefined) return;
      game.moveLeft(data.uuid, infos.socketsId);
    });
    socket.on('rotate', (data) => {
      const infos: ClientInfo | undefined = this.waitGame
        .getUUIDMapings()
        .get(data.uuid);
      if (infos == undefined) return;
      const games = this.waitGame.getGames();
      const game = games.get(data.roomId);
      if (game == undefined) return;
      game.rotate(data.uuid, infos.socketsId);
    });
    socket.on('moveDown', (data) => {
      const infos: ClientInfo | undefined = this.waitGame
        .getUUIDMapings()
        .get(data.uuid);
      if (infos == undefined) return;
      const games = this.waitGame.getGames();
      const game = games.get(data.roomId);
      if (game == undefined) return;
      game.moveDown(data.uuid, infos.socketsId);
    });
    socket.on('fallDown', (data) => {
      const infos: ClientInfo | undefined = this.waitGame
        .getUUIDMapings()
        .get(data.uuid);
      if (infos == undefined) return;
      const games = this.waitGame.getGames();
      const game = games.get(data.roomId);
      if (game == undefined) return;
      game.fallDown(data.uuid, infos.socketsId);
    });

    socket.on('getActiveRooms', (data) => {
      if (data == undefined || data.uuid == undefined) return;
      const infos = this.waitGame.getUUIDMapings().get(data.uuid);
      if (infos == undefined) return;
      infos.socketsId.push(socket.id);
      const activeRooms = [];
      for (let i = 0; i < infos.ownedRoomsId.length; i++) {
        socket.join(infos.ownedRoomsId[i]);
        if (
          this.waitGame.getGames().get(infos.ownedRoomsId[i])?.getType() ===
          SINGLE
        ) {
          activeRooms.push(infos.ownedRoomsId[i]);
        }
      }
      for (let i = 0; i < infos.otherRoomsId.length; i++) {
        socket.join(infos.otherRoomsId[i]);
      }

      socket.emit('getActiveRooms', {
        activeRooms: activeRooms,
      });
    });

    socket.on('createRoom', (data) => {
      console.log(data);
      const infos = this.manageSocket.getInfos(data.uuid);
      console.log({ infos: infos });
      if (infos == undefined) {
        return;
      }
      this.waitGame.createGame(data.uuid, infos.name, socket.id);
    });

    socket.on('getCreateRooms', (data) => {
      if (data == undefined || data.uuid == undefined) return;
      const infos = this.waitGame.getUUIDMapings().get(data.uuid);
      if (infos == undefined) return;
      infos.socketsId.push(socket.id);
      const createRooms = [];
      for (let i = 0; i < infos.ownedRoomsId.length; i++) {
        socket.join(infos.ownedRoomsId[i]);
        if (
          this.waitGame.getGames().get(infos.ownedRoomsId[i])?.getType() ===
            MULTI &&
          !this.waitGame.getGames().get(infos.ownedRoomsId[i])?.getIsStarted()
        ) {
          createRooms.push(infos.ownedRoomsId[i]);
        }
      }
      for (let i = 0; i < infos.otherRoomsId.length; i++) {
        socket.join(infos.otherRoomsId[i]);
      }
      socket.emit('getCreateRooms', {
        createRooms: createRooms,
      });
    });
    socket.on('getOtherRooms', (data) => {
      if (data == undefined || data.uuid == undefined) return;
      console.log('je passe ici');
      const infosPlayer = this.manageSocket.getInfos(data.uuid);
      console.log({ infos: infosPlayer });
      if (infosPlayer == undefined) {
        return;
      }
      const games = this.waitGame.getGames();
      const infos = this.waitGame.getUUIDMapings().get(data.uuid);
      console.log({ infos: infos });
      const otherRooms = [];
      for (const [key, value] of games) {
        console.log({ key: key });
        console.log({ value: value.getRoomId() });
        if (
          value.getType() === MULTI &&
          (infos == undefined ||
            (!infos.ownedRoomsId.some((elem) => elem === value.getRoomId()) &&
              !infos.otherRoomsId.some((elem) => elem === value.getRoomId())))
        ) {
          otherRooms.push(value.getRoomId());
        }
      }
      console.log('lala');
      socket.emit('getOtherRooms', {
        otherRooms: otherRooms,
      });
    });
    // const infos = this.waitGame.getUUIDMapings().get(data.uuid);
    // if (infos == undefined) return;
    // infos.socketsId.push(socket.id);
    // const otherRooms = [];
    // for (let i = 0; i < infos.otherRoomsId.length; i++) {
    //   socket.join(infos.otherRoomsId[i]);
    //   if (
    //     this.waitGame.getGames().get(infos.otherRoomsId[i])?.getType() ===
    //     MULTI
    //   ) {
    //     otherRooms.push(infos.otherRoomsId[i]);
    //   }
    // }
    // for (let i = 0; i < infos.ownedRoomsId.length; i++) {
    //   socket.join(infos.ownedRoomsId[i]);
    // }
    // socket.emit('getOthersRooms', {
    //   otherRooms: otherRooms,
    // });

    // socket.on('isInGame', (data) => {
    //   const uuid = data.uuid;
    //   const playerWaits = this.waitGame.getPlayerWaiting();
    //   if (playerWaits.length != 0) {
    //     const room = this.waitGame.getRoomName();
    //     socket.join(room);
    //   }
    //   // const infos = this.manageSocket.getInfos(uuid);
    //   // console.log({ infos: infos?.sockets });
    //   const rooms = this.waitGame.isInGame(uuid, socket.id);
    //   if (rooms == undefined) {
    //     return;
    //   }
    //   socket.join(rooms);
    //   const games = this.waitGame.getGames();
    //   const game = games.get(rooms[0]);
    //   if (game == undefined) {
    //     return;
    //   }
    //   game.sendCounterToClient();
    // });
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
