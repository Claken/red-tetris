import { Server } from 'socket.io';
import { Game } from '../game/game';
import { ClientInfo } from '../../interfaces/clientInfo';
import { Player } from '../player/player';
import { ManagePlayerTetromino } from '../managePlayerTetromino/managePlayerTetromino';
import { ManageSocket } from '../manageSocket/manageSocket';

export class WaitGame {
  private static _instance: WaitGame;
  private _server: Server;
  private room_name = '';
  private games: Map<string, Game> = new Map();
  private UUIDMapings: Map<string, ClientInfo> = new Map();
  private _playerWaiting: Player[] = [];
  private constructor(server: Server) {
    this._server = server;
  }
  public static getInstance(server: Server): WaitGame {
    if (!WaitGame._instance) {
      WaitGame._instance = new WaitGame(server);
    }
    return WaitGame._instance;
  }

  public getRoomName = (): string => {
    return this.room_name;
  };

  public getPlayerWaiting = (): Player[] => {
    return this._playerWaiting;
  };

  private startGame(): void {
    const managePT = new ManagePlayerTetromino();
    managePT.injectmultipleTetromino(
      this._playerWaiting[0],
      this._playerWaiting[1],
      100,
    );
    const game = new Game(
      this.room_name,
      this._playerWaiting[0],
      this._playerWaiting[1],
      this._server,
    );
    const uuid1 = this._playerWaiting[0].getUuid();
    const uuid2 = this._playerWaiting[1].getUuid();
    this.games.set(this.room_name, game);
    game.startGame();
    const roomName = this.room_name;
    const intervalId = setInterval(() => {
      game.gamePlay();
      if (game.endGame()) {
        clearInterval(intervalId);
        // console.log('end game');
        // console.log(this.UUIDMapings.get(uuid1));
        let index: number | undefined =
          this.UUIDMapings.get(uuid1)?.roomId.indexOf(roomName);
        // console.log({ room_name: roomName });
        if (index != undefined && index !== -1) {
          this.UUIDMapings.get(uuid1)?.roomId.splice(index, 1);
        }
        index = this.UUIDMapings.get(uuid2)?.roomId.indexOf(roomName);
        if (index != undefined && index !== -1) {
          this.UUIDMapings.get(uuid2)?.roomId.splice(index, 1);
        }
        this.UUIDMapings.get(uuid1)?.socketId.forEach((socketId) => {
          const socket = this._server.sockets.sockets.get(socketId);
          if (socket !== undefined) {
            socket.leave(roomName);
          }
        });
        this.UUIDMapings.get(uuid2)?.socketId.forEach((socketId) => {
          const socket = this._server.sockets.sockets.get(socketId);
          if (socket !== undefined) {
            socket.leave(roomName);
          }
        });
        this.games.delete(roomName);
        // console.log(this.UUIDMapings.get(uuid1));
      }
    }, 1000); // update every second
  }

  public getGames(): Map<string, Game> {
    return this.games;
  }

  public deleteSocket(socketId: string): void {
    this.UUIDMapings.forEach((value) => {
      const index = value.socketId.indexOf(socketId);
      if (index !== -1) {
        value.socketId.splice(index, 1);
      }
    });
  }

  public isInGame(uuid: string, socketId: string): any {
    const infos = this.UUIDMapings.get(uuid);
    if (infos === undefined) {
      return;
    }
    const rooms: any = [];
    if (infos.roomId.length > 0) {
      infos.roomId.forEach((roomName) => {
        const game = this.games.get(roomName);
        if (game !== undefined) {
          rooms.push(roomName);
        }
      });
      infos.socketId.push(socketId);
    }
    return rooms;
  }

  public addPlayer(uuid: string, name: string, socketId: string): void {
    if (this._playerWaiting.find((player) => player.getUuid() === uuid)) {
      return;
    }
    const player1 = new Player(name, uuid);
    this._playerWaiting.push(player1);
    const instanceManageSocket = ManageSocket.getInstance();
    const socket = instanceManageSocket
      .getInfos(uuid)
      ?.sockets.filter((elem) => elem.id === socketId)[0];
    if (socket === undefined) return;
    if (this.UUIDMapings.has(uuid)) {
      // console.log('je suis dans le premier');
      if (this.room_name === '') {
        let roomName = name;
        const infos = this.UUIDMapings.get(uuid);
        let i = 0;
        // console.log({ romId: infos?.roomId });
        while (infos?.roomId.includes(roomName)) {
          roomName = name + i;
          i++;
        }
        this.room_name = roomName;
      }
      const infos = this.UUIDMapings.get(uuid);
      if (!infos?.socketId.includes(socketId)) {
        infos?.socketId.push(socketId);
      }
      infos?.roomId.push(this.room_name);
      socket.join(this.room_name);
    } else {
      if (this.room_name === '') {
        this.room_name = name;
      }
      socket.join(this.room_name);
      this.UUIDMapings.set(uuid, {
        socketId: [socketId],
        roomId: [this.room_name],
        name: name,
      });
    }
    if (this._playerWaiting.length === 1) {
      player1.setIsMaster(true);
      socket.emit('waitToPlay', { roomId: this.room_name, name: name });
    } else if (this._playerWaiting.length === 2) {
      socket.emit('waitToPlay', { roomId: this.room_name, name: name });
      this.startGame();
      this.room_name = '';
      this._playerWaiting = [];
    }
  }
}
