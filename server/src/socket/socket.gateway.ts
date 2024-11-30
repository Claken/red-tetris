import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { Game } from '../../class/game/game';
import { Socket, Server } from 'socket.io';
import { WaitGame } from '../../class/waitGame/waitGame';
import { SocketService } from './socket.service';
import { ManageSocket } from '../../class/manageSocket/manageSocket';
import { ClientInfo } from '../../interfaces/clientInfo';
import { SINGLE, MULTI } from '../../constantes/constantes';
import { Player } from 'class/player/player';

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
    socket.on('checkGame', (data) => {
      console.log('je passe');
      const infos = this.manageSocket.getInfos(data.uuid);
      if (infos == undefined) {
        return;
      }
      const game: Game | undefined = this.waitGame.getGames().get(data.roomId);
      if (game == undefined) {
        socket.emit('noGame');
        return;
      }
      if (game.getType() === SINGLE) {
        console.log('single');
        const player = game.getPlayers()[0];
        socket.emit('myGame', {
          player: {
            grid: player.getGrid(),
            name: player.getPlayerName(),
            uuid: player.getUuid(),
            roomId: data.roomId,
            tetrominos: player.getTetrominos().slice(1, 6),
            type: game.getType(),
          },
        });
        return;
      }
    });

    socket.on('getWaitingList', (data) => {
      const infos = this.manageSocket.getInfos(data.uuid);
      if (infos == undefined) {
        return;
      }
      const game: Game | undefined = this.waitGame.getGames().get(data.roomId);
      const name = game
        ?.get_waitingPlayers()
        .map((elem) => elem.getPlayerName());
      socket.emit('list_players_room', { roomId: data.roomId, players: name });
    });

    socket.on('notRetryGame', (data) => {
      const infos = this.manageSocket.getInfos(data.uuid);
      if (infos == undefined) {
        return;
      }
      this.waitGame.notRetryGame(data.uuid, infos.name, socket.id, data.roomId);
    });

    socket.on('retryGame', (data) => {
      const infos = this.manageSocket.getInfos(data.uuid);
      if (infos == undefined) {
        return;
      }
      this.waitGame.retryGame(data.uuid, infos.name, socket.id, data.roomId);
    });

    socket.on('startSingleTetrisGame', (data) => {
      // console.log(data);
      const infos = this.manageSocket.getInfos(data.uuid);
      if (infos == undefined) {
        return;
      }
      this.waitGame.startSingleTetrisGame(data.uuid, infos.name, socket.id);
    });
    socket.on('startMultiGame', (data) => {
      // console.log(data);
      const infos = this.manageSocket.getInfos(data.uuid);
      if (infos == undefined) {
        return;
      }
      this.waitGame.startMultiTetrisGame(
        data.uuid,
        infos.name,
        socket.id,
        data.roomId,
      );
    });
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
      if (!infos.socketsId.some((elem) => elem === socket.id)) {
        infos.socketsId.push(socket.id);
      }
      const activeRooms = [];
      for (let i = 0; i < infos.ownedRoomsId.length; i++) {
        socket.join(infos.ownedRoomsId[i]);
        if (
          this.waitGame.getGames().get(infos.ownedRoomsId[i])?.getType() ===
            SINGLE ||
          this.waitGame.getGames().get(infos.ownedRoomsId[i])?.getIsStarted()
        ) {
          activeRooms.push(infos.ownedRoomsId[i]);
        }
      }
      for (let i = 0; i < infos.otherRoomsId.length; i++) {
        if (this.waitGame.getGames().get(infos.otherRoomsId[i])?.getIsStarted())
          activeRooms.push(infos.otherRoomsId[i]);
        socket.join(infos.otherRoomsId[i]);
      }

      socket.emit('getActiveRooms', {
        activeRooms: activeRooms,
      });
    });

    socket.on('createRoom', (data) => {
      const infos = this.manageSocket.getInfos(data.uuid);
      if (infos == undefined) {
        return;
      }
      this.waitGame.createGame(data.uuid, infos.name, socket.id);
    });

    socket.on('joinGame', (data) => {
      const infos = this.manageSocket.getInfos(data.uuid);
      if (infos == undefined) {
        return;
      }
      this.waitGame.joinGame(data.uuid, infos.name, socket.id, data.roomId);
    });

    socket.on('getCreateRooms', (data) => {
      if (data == undefined || data.uuid == undefined) return;
      const infos = this.waitGame.getUUIDMapings().get(data.uuid);
      if (infos == undefined) return;
      if (!infos.socketsId.some((elem) => elem === socket.id)) {
        infos.socketsId.push(socket.id);
      }
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
      const infosPlayer = this.manageSocket.getInfos(data.uuid);
      if (infosPlayer == undefined) {
        return;
      }
      const games = this.waitGame.getGames();
      const infos = this.waitGame.getUUIDMapings().get(data.uuid);
      const otherRooms = [];
      for (const [key, value] of games) {
        if (
          value.getType() === MULTI &&
          (infos == undefined ||
            (!infos.ownedRoomsId.some((elem) => elem === value.getRoomId()) &&
              !infos.otherRoomsId.some((elem) => elem === value.getRoomId())))
        ) {
          otherRooms.push(value.getRoomId());
        }
      }
      socket.emit('getOtherRooms', {
        otherRooms: otherRooms,
      });
    });
    socket.on('getOthersRoomsJoined', (data) => {
      if (data == undefined || data.uuid == undefined) return;
      const infos = this.waitGame.getUUIDMapings().get(data.uuid);
      if (infos == undefined) return;
      if (!infos.socketsId.some((elem) => elem === socket.id)) {
        infos.socketsId.push(socket.id);
      }
      const roomsJoined = [];
      for (let i = 0; i < infos.otherRoomsId.length; i++) {
        socket.join(infos.otherRoomsId[i]);
        if (
          this.waitGame.getGames().get(infos.otherRoomsId[i])?.getType() ===
            MULTI &&
          !this.waitGame.getGames().get(infos.otherRoomsId[i])?.getIsStarted()
        ) {
          roomsJoined.push(infos.otherRoomsId[i]);
        }
      }
      for (let i = 0; i < infos.ownedRoomsId.length; i++) {
        socket.join(infos.ownedRoomsId[i]);
      }
      socket.emit('getOthersRoomsJoined', {
        roomsJoined: roomsJoined,
      });
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
    if (uuid !== undefined || typeof uuid == 'string') {
      this.waitGame.addSocket(uuid, socket.id);
    }
    this.listenToEmmitter(socket);
  }

  handleDisconnect(socket: Socket): void {
    this.waitGame.deleteSocket(socket.id);
    this.manageSocket.deleteSocket(socket);
  }
  // Implement other Socket.IO event handlers and message handlers
}
