import { Server } from 'socket.io';
import { Game } from '../game/game';
import { ClientInfo } from '../../interfaces/clientInfo';
import { SINGLE, MULTI } from '../../constantes/constantes';
import { Player } from '../player/player';
// import { ManagePlayerTetromino } from '../managePlayerTetromino/managePlayerTetromino';
// import { ManageSocket } from '../manageSocket/manageSocket';
// gfg

export class WaitGame {
  private static _instance: WaitGame;
  private _server: Server;
  private games: Map<string, Game> = new Map(); // roomId / game
  private UUIDMapings: Map<string, ClientInfo> = new Map(); // uuid / socketId[] roomId[] name;
  private constructor(server: Server) {
    this._server = server;
  }
  public static getInstance(server: Server): WaitGame {
    if (!WaitGame._instance) {
      WaitGame._instance = new WaitGame(server);
    }
    return WaitGame._instance;
  }

  public getGames(): Map<string, Game> {
    return this.games;
  }
  public getUUIDMapings(): Map<string, ClientInfo> {
    return this.UUIDMapings;
  }

  public addSocket(uuid: string, socketId: string): void {
    if (!this.UUIDMapings.has(uuid)) {
      this.UUIDMapings.set(uuid, {
        socketsId: [],
        ownedRoomsId: [],
        otherRoomsId: [],
        name: '',
      });
    }
    const infos: ClientInfo = this.UUIDMapings.get(uuid) as ClientInfo;
    if (!infos.socketsId.includes(socketId)) {
      infos.socketsId.push(socketId);
      for (let i = 0; i < infos.ownedRoomsId.length; i++) {
        this._server.sockets.sockets.get(socketId)?.join(infos.ownedRoomsId[i]);
      }
      for (let i = 0; i < infos.otherRoomsId.length; i++) {
        this._server.sockets.sockets.get(socketId)?.join(infos.otherRoomsId[i]);
      }
    }
  }

  public deleteSocket(socketId: string): void {
    this.UUIDMapings.forEach((value) => {
      const index = value.socketsId.indexOf(socketId);
      if (index !== -1) {
        value.socketsId.splice(index, 1);
      }
    });
  }

  public createGame(uuid: string, name: string, socketId: string) {
    const socket = this._server.sockets.sockets.get(socketId);
    if (socket === undefined) return;
    if (!this.UUIDMapings.has(uuid)) {
      this.UUIDMapings.set(uuid, {
        socketsId: [],
        ownedRoomsId: [],
        otherRoomsId: [],
        name: name,
      });
    }
    const infos: ClientInfo = this.UUIDMapings.get(uuid) as ClientInfo;
    if (!infos.socketsId.includes(socketId)) {
      infos.socketsId.push(socketId);
    }
    let roomName = name;
    let i = 0;
    while (
      this.games.has(roomName) ||
      infos.ownedRoomsId.includes(roomName) ||
      infos.otherRoomsId.includes(roomName)
    ) {
      roomName = name + i;
      i++;
    }
    infos.ownedRoomsId.push(roomName);
    socket.join(roomName);
    const player = new Player(name, uuid);
    player.setIsMaster(true);
    const game = new Game([], roomName, MULTI, this._server);
    this.games.set(roomName, game);
    game.addWaitingPlayer(player);
    //
    const createRooms = [];
    for (let i = 0; i < infos.ownedRoomsId.length; i++) {
      if (
        this.getGames().get(infos.ownedRoomsId[i])?.getType() === MULTI &&
        !this.getGames().get(infos.ownedRoomsId[i])?.getIsStarted()
      ) {
        createRooms.push(infos.ownedRoomsId[i]);
      }
    }
    //
    this._server.to(infos.socketsId).emit('getCreateRooms', {
      createRooms: createRooms,
    });
  }

  public async joinGame(
    uuid: string,
    name: string,
    socketId: string,
    roomId: string,
  ) {
    const socket = this._server.sockets.sockets.get(socketId);
    if (socket === undefined) return;
    if (!this.UUIDMapings.has(uuid)) {
      this.UUIDMapings.set(uuid, {
        socketsId: [],
        ownedRoomsId: [],
        otherRoomsId: [],
        name: name,
      });
    }
    const infos: ClientInfo = this.UUIDMapings.get(uuid) as ClientInfo;
    if (!infos.socketsId.includes(socketId)) {
      infos.socketsId.push(socketId);
    }
    const game = this.games.get(roomId);
    if (game === undefined) return;
    const waitPlayer = game
      .get_waitingPlayers()
      .find((player) => player.getUuid() === uuid);
    const player = game
      .getPlayers()
      .find((player) => player.getUuid() === uuid);
    const lostPlayer = game
      .get_lostPlayers()
      .find((player) => player.getUuid() === uuid);
    if (
      player !== undefined ||
      waitPlayer !== undefined ||
      lostPlayer !== undefined
    ) {
      return;
    }
    game.addWaitingPlayer(new Player(name, uuid));
    socket.join(roomId);
    if (!infos.otherRoomsId.includes(roomId)) {
      infos.otherRoomsId.push(roomId);
    }
    socket.emit('pageToGo', {
      pageInfos: {
        path: roomId + '/' + name,
        name: name,
        roomName: roomId,
      },
    });
  }

  public async startSingleTetrisGame(
    uuid: string,
    name: string,
    socketId: string,
  ): Promise<void> {
    const socket = this._server.sockets.sockets.get(socketId);
    if (socket === undefined) return;
    if (!this.UUIDMapings.has(uuid)) {
      this.UUIDMapings.set(uuid, {
        socketsId: [],
        ownedRoomsId: [],
        otherRoomsId: [],
        name: name,
      });
    }
    const infos: ClientInfo = this.UUIDMapings.get(uuid) as ClientInfo;
    if (!infos.socketsId.includes(socketId)) {
      infos.socketsId.push(socketId);
    }
    let roomName = name;
    let i = 0;
    while (
      this.games.has(roomName) ||
      infos.ownedRoomsId.includes(roomName) ||
      infos.otherRoomsId.includes(roomName)
    ) {
      roomName = name + i;
      i++;
    }
    infos.ownedRoomsId.push(roomName);
    socket.join(roomName);
    const player = new Player(name, uuid);
    player.setIsMaster(true);
    const game = new Game([player], roomName, SINGLE, this._server);
    this.games.set(roomName, game);
    await this.pageToGo(uuid, roomName, SINGLE, player.getPlayerName());
    await game.startGame(this.UUIDMapings);
    const touch = { touch1: 1 };
    let gameIsOver = false;
    const intervalId = setInterval(() => {
      const socketsId = this.UUIDMapings.get(uuid)?.socketsId as string[];

      game.gamePlay(player, touch, socketsId);
      if (gameIsOver == false) gameIsOver = game.endGame(this.UUIDMapings);
      if (gameIsOver) {
        clearInterval(intervalId);
        for (let i = 0; i < socketsId.length; i++) {
          const socket = this._server.sockets.sockets.get(socketsId[i]);
          if (socket !== undefined) socket.leave(roomName);
        }
        infos.ownedRoomsId.splice(infos.ownedRoomsId.indexOf(roomName), 1);
        this.games.delete(roomName);
      }
    }, 1000); // update every second
  }

  public notRetryGame(
    uuid: string,
    name: string,
    socketId: string,
    roomId: string,
  ) {
    const sockets = this._server.sockets.sockets.get(socketId);
    if (sockets === undefined) return;
    const infos: ClientInfo = this.UUIDMapings.get(uuid) as ClientInfo;
    if (infos === undefined) return;
    const game = this.games.get(roomId);
    if (game === undefined) return;
    // le joueur ne fait plus partie de la room
    const player_lost = game
      .get_lostPlayers()
      .find((player) => player.getUuid() === uuid);

    const player = game
      .getPlayers()
      .find((player) => player.getUuid() === uuid);

    if (player === undefined && player_lost === undefined) {
      return;
    }
    if (
      (player != undefined && player.getIsMaster()) ||
      (player_lost != undefined && player_lost.getIsMaster())
    ) {
      game.changePlayerToWaiting(uuid);
      return;
    }
    const socketsId = this.UUIDMapings.get(uuid)?.socketsId as string[];
    for (let i = 0; i < socketsId.length; i++) {
      const socket = this._server.sockets.sockets.get(socketsId[i]);
      if (socket !== undefined) socket.leave(roomId);
    }
    infos.otherRoomsId.splice(infos.otherRoomsId.indexOf(roomId), 1);
    game.removeLostPlayer(uuid);
    game.removePlayer(uuid);
  }

  private clearGame(game: Game) {
    const lostPlayers = game.get_lostPlayers();
    const players = game.getPlayers();

    for (let i = 0; i < lostPlayers.length; i++) {
      const uuid = lostPlayers[i].getUuid();
      const roomId = game.getRoomId();

      if (lostPlayers[i].getIsMaster()) {
        game.changePlayerToWaiting(uuid);
        continue;
      }

      const infos: ClientInfo = this.UUIDMapings.get(uuid) as ClientInfo;
      const socketsId = this.UUIDMapings.get(uuid)?.socketsId as string[];
      for (let i = 0; i < socketsId.length; i++) {
        const socket = this._server.sockets.sockets.get(socketsId[i]);
        if (socket !== undefined) socket.leave(roomId);
      }
      infos.otherRoomsId.splice(infos.otherRoomsId.indexOf(roomId), 1);
      game.removeLostPlayer(uuid);
    }
    for (let i = 0; i < players.length; i++) {
      const uuid = players[i].getUuid();
      const roomId = game.getRoomId();

      if (players[i].getIsMaster()) {
        game.changePlayerToWaiting(uuid);
        continue;
      }

      const infos: ClientInfo = this.UUIDMapings.get(uuid) as ClientInfo;
      const socketsId = this.UUIDMapings.get(uuid)?.socketsId as string[];
      for (let i = 0; i < socketsId.length; i++) {
        const socket = this._server.sockets.sockets.get(socketsId[i]);
        if (socket !== undefined) socket.leave(roomId);
      }
      infos.otherRoomsId.splice(infos.otherRoomsId.indexOf(roomId), 1);
      game.removePlayer(uuid);
    }
  }

  public async retryGame(
    uuid: string,
    name: string,
    socketId: string,
    roomId: string,
  ) {
    const sockets = this._server.sockets.sockets.get(socketId);
    if (sockets === undefined) return;
    const infos: ClientInfo = this.UUIDMapings.get(uuid) as ClientInfo;
    if (infos === undefined) return;
    const game = this.games.get(roomId);
    if (game === undefined) return;
    const intervalId = setInterval(async () => {
      if (game.getIsStarted() == false) {
        clearInterval(intervalId);
        game.changePlayerToWaiting(uuid);
        const player = game
          .get_waitingPlayers()
          .find((player) => player.getUuid() === uuid);
        if (player?.getIsMaster() === true) {
          await new Promise((resolve) => {
            setTimeout(() => {
              this.startMultiTetrisGame(uuid, name, socketId, roomId);
              resolve(1);
            }, 5000);
          });
        }
      }
    }, 1000);

    // console.log(game.getIsStarted());
    // if (game.getIsStarted()) {
    //   return;
    // }
    // // attendre 5 secondes avant de relancer la partie
    // game.changePlayerToWaiting(uuid);
    // const player = game
    //   .get_waitingPlayers()
    //   .find((player) => player.getUuid() === uuid);
    // if (player?.getIsMaster() === true) {
    //   await new Promise((resolve) => {
    //     setTimeout(() => {
    //       this.startMultiTetrisGame(uuid, name, socketId, roomId);
    //       resolve(1);
    //     }, 5000);
    //   });
    // }
  }

  public async startMultiTetrisGame(
    uuid: string,
    name: string,
    socketId: string,
    roomId: string,
  ): Promise<void> {
    console.log('start game');
    const socket = this._server.sockets.sockets.get(socketId);
    if (socket === undefined) return;
    if (!this.UUIDMapings.has(uuid)) return;
    const infos: ClientInfo = this.UUIDMapings.get(uuid) as ClientInfo;
    const game = this.games.get(roomId);
    if (game === undefined) return;
    // game.setIsStarted(true);

    this.clearGame(game);

    if (game.get_waitingPlayers().length <= 1) {
      this._server.to(socketId).emit('not_enough_person', {
        message: 'Not enough person to start the game',
      });
      return;
    }

    await game.startGame(this.UUIDMapings);
    const intervalId = setInterval(() => {
      if (game.endGame(this.UUIDMapings)) {
        clearInterval(intervalId);
      }
      game.gamePlayMulti(this.UUIDMapings);
    }, 1000); // update every second
  }

  private async pageToGo(
    uuid: string,
    roomName: string,
    type: number,
    name: string,
  ): Promise<void> {
    // const infos: ClientInfo | undefined = this.UUIDMapings.get(uuid);
    // if (infos === undefined) return;
    if (type == SINGLE) {
      this._server.to(roomName).emit('pageToGo', {
        pageInfos: {
          path: roomName + '/' + name,
          name: name,
          roomName: roomName,
        },
      });
    }
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(1);
      }, 1000);
    });
    return;
  }
}
