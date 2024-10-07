import { Server } from 'socket.io';
import { Game } from '../game/game';
import { ClientInfo } from '../../interfaces/clientInfo';
import { SINGLE, MULTI } from '../../constantes/constantes';
import { Player } from '../player/player';
// import { ManagePlayerTetromino } from '../managePlayerTetromino/managePlayerTetromino';
// import { ManageSocket } from '../manageSocket/manageSocket';

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
    await game.startGame(this.UUIDMapings);
    const touch = { touch1: 1 };
    let gameIsOver = false;
    const intervalId = setInterval(() => {
      const socketsId = this.UUIDMapings.get(uuid)?.socketsId as string[];
      game.gamePlay(player, touch, socketsId);
      if (gameIsOver == false) gameIsOver = game.endGame();
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

  // private startGameSolo(): void {
  //   const managePT = new ManagePlayerTetromino();
  //   managePT.injectmultipleTetrominoSolo(this._playerWaiting[0], 100);
  //   const game = new Game(
  //     this.room_single,
  //     this._server,
  //     this._playerWaiting[0],
  //     undefined,
  //   );
  //   const uuid1 = this._playerWaiting[0].getUuid();
  //   this.games.set(this.room_single, game);
  //   game.startGame();
  //   const roomName = this.room_single;
  //   console.log({ roomName: roomName });
  //   const touch = { touch1: 1, touch2: 1 };
  //   const intervalId = setInterval(() => {
  //     if (game.haveToReloadTetrominos()) {
  //       managePT.injectmultipleTetrominoSolo(game.getPlayer1(), 10);
  //     }
  //     game.gamePlay(touch);
  //     if (game.endGame()) {
  //       clearInterval(intervalId);
  //       const index: number | undefined =
  //         this.UUIDMapings.get(uuid1)?.roomId.indexOf(roomName);
  //       if (index != undefined && index !== -1) {
  //         this.UUIDMapings.get(uuid1)?.roomId.splice(index, 1);
  //       }
  //       this.UUIDMapings.get(uuid1)?.socketId.forEach((socketId) => {
  //         const socket = this._server.sockets.sockets.get(socketId);
  //         if (socket !== undefined) {
  //           socket.leave(roomName);
  //         }
  //       });
  //       console.log({ roomName: roomName });
  //       this.games.delete(roomName);
  //     }
  //   }, 1000); // update every second
  // }

  // private startGame(): void {
  //   if (this._playerWaiting.length === 1) {
  //     this.startGameSolo();
  //     return;
  //   }
  //   const managePT = new ManagePlayerTetromino();
  //   managePT.injectmultipleTetromino(
  //     this._playerWaiting[0],
  //     this._playerWaiting[1],
  //     100,
  //   );

  //   const game = new Game(
  //     this.room_name,
  //     this._server,
  //     this._playerWaiting[0],
  //     this._playerWaiting[1],
  //   );
  //   const uuid1 = this._playerWaiting[0].getUuid();
  //   const uuid2 = this._playerWaiting[1].getUuid();
  //   this.games.set(this.room_name, game);
  //   game.startGame();
  //   const roomName = this.room_name;
  //   const touch = { touch1: 1, touch2: 1 };
  //   const intervalId = setInterval(() => {
  //     if (game.haveToReloadTetrominos()) {
  //       const player2 = game.getPlayer2();
  //       if (player2 != undefined) {
  //         managePT.injectmultipleTetromino(game.getPlayer1(), player2, 10);
  //       }
  //     }
  //     game.gamePlay(touch);
  //     if (game.endGame()) {
  //       clearInterval(intervalId);
  //       // console.log('end game');
  //       // console.log(this.UUIDMapings.get(uuid1));
  //       let index: number | undefined =
  //         this.UUIDMapings.get(uuid1)?.roomId.indexOf(roomName);
  //       // console.log({ room_name: roomName });
  //       if (index != undefined && index !== -1) {
  //         this.UUIDMapings.get(uuid1)?.roomId.splice(index, 1);
  //       }
  //       index = this.UUIDMapings.get(uuid2)?.roomId.indexOf(roomName);
  //       if (index != undefined && index !== -1) {
  //         this.UUIDMapings.get(uuid2)?.roomId.splice(index, 1);
  //       }
  //       this.UUIDMapings.get(uuid1)?.socketId.forEach((socketId) => {
  //         const socket = this._server.sockets.sockets.get(socketId);
  //         if (socket !== undefined) {
  //           socket.leave(roomName);
  //         }
  //       });
  //       this.UUIDMapings.get(uuid2)?.socketId.forEach((socketId) => {
  //         const socket = this._server.sockets.sockets.get(socketId);
  //         if (socket !== undefined) {
  //           socket.leave(roomName);
  //         }
  //       });
  //       this.games.delete(roomName);
  //       // console.log(this.UUIDMapings.get(uuid1));
  //     }
  //   }, 1000); // update every second
  // }

  // public getGames(): Map<string, Game> {
  //   return this.games;
  // }

  // public isInGame(uuid: string, socketId: string): any {
  //   const infos = this.UUIDMapings.get(uuid);
  //   if (infos === undefined) {
  //     return;
  //   }
  //   const rooms: any = [];
  //   if (infos.roomId.length > 0) {
  //     infos.roomId.forEach((roomName) => {
  //       const game = this.games.get(roomName);
  //       if (game !== undefined) {
  //         rooms.push(roomName);
  //       }
  //     });
  //     infos.socketId.push(socketId);
  //   }
  //   return rooms;
  // }

  // public addPlayer(
  //   uuid: string,
  //   name: string,
  //   socketId: string,
  //   isGameSingle: boolean,
  // ): void {
  //   if (this._playerWaiting.find((player) => player.getUuid() === uuid)) {
  //     return;
  //   }
  //   const player1 = new Player(name, uuid);
  //   if (isGameSingle) {
  //     this._playerWaiting.unshift(player1);
  //   } else {
  //     this._playerWaiting.push(player1);
  //   }
  //   const instanceManageSocket = ManageSocket.getInstance();
  //   const socket = instanceManageSocket
  //     .getInfos(uuid)
  //     ?.sockets.filter((elem) => elem.id === socketId)[0];
  //   if (socket === undefined) return;
  //   if (this.UUIDMapings.has(uuid)) {
  //     // console.log('je suis dans le premier');
  //     if (this.room_name === '') {
  //       let roomName = name;
  //       const infos = this.UUIDMapings.get(uuid);
  //       let i = 0;
  //       // console.log({ romId: infos?.roomId });
  //       while (this.games.has(roomName) || infos?.roomId.includes(roomName)) {
  //         roomName = name + i;
  //         i++;
  //       }
  //       if (isGameSingle) {
  //         this.room_single = roomName;
  //       } else {
  //         this.room_name = roomName;
  //       }
  //     }
  //     const infos = this.UUIDMapings.get(uuid);
  //     if (!infos?.socketId.includes(socketId)) {
  //       infos?.socketId.push(socketId);
  //     }
  //     if (isGameSingle) {
  //       infos?.roomId.push(this.room_single);
  //       socket.join(this.room_single);
  //     } else {
  //       infos?.roomId.push(this.room_name);
  //       socket.join(this.room_name);
  //     }
  //   } else {
  //     if (this.room_name === '') {
  //       let roomName = name;
  //       const infos = this.UUIDMapings.get(uuid);
  //       let i = 0;
  //       // console.log({ romId: infos?.roomId });
  //       while (this.games.has(roomName) || infos?.roomId.includes(roomName)) {
  //         roomName = name + i;
  //         i++;
  //       }
  //       if (isGameSingle) {
  //         this.room_single = roomName;
  //       } else {
  //         this.room_name = roomName;
  //       }
  //     }
  //     if (isGameSingle) {
  //       socket.join(this.room_single);
  //       this.UUIDMapings.set(uuid, {
  //         socketId: [socketId],
  //         roomId: [this.room_single],
  //         name: name,
  //       });
  //     } else {
  //       socket.join(this.room_name);
  //       this.UUIDMapings.set(uuid, {
  //         socketId: [socketId],
  //         roomId: [this.room_name],
  //         name: name,
  //       });
  //     }
  //   }
  //   if (this._playerWaiting.length === 1) {
  //     player1.setIsMaster(true);
  //     if (isGameSingle) {
  //       socket.emit('waitToPlay', { roomId: this.room_single, name: name });
  //     } else socket.emit('waitToPlay', { roomId: this.room_name, name: name });
  //     if (isGameSingle) {
  //       console.log('je passe ici');
  //       this.startGame();
  //       this.room_single = '';
  //       this._playerWaiting.shift();
  //     }
  //   } else if (this._playerWaiting.length === 2) {
  //     if (isGameSingle) {
  //       socket.emit('waitToPlay', { roomId: this.room_single, name: name });
  //       this.startGameSolo();
  //       this.room_single = '';
  //       this._playerWaiting.shift();
  //     } else {
  //       socket.emit('waitToPlay', { roomId: this.room_name, name: name });
  //       this.startGame();
  //       this.room_name = '';
  //       this._playerWaiting = [];
  //     }
  //   }
  // }
}
