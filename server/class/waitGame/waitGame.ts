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
    this.games.set(this.room_name, game);
    game.startGame();
  }

  public getGames(): Map<string, Game> {
    return this.games;
  }

  public addPlayer(uuid: string, name: string, socketId: string): void {
    // check if the player is already in the waiting list
    // uuid recupere le socket.id et le nom du joueur qui se trouve dans le socketManager
    // console.log(this._playerWaiting[0]?.getUuid());
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
      infos?.socketId.push(socketId);
      infos?.roomId.push(this.room_name);
      socket.join(this.room_name);
      // checker dans clientInfo si un le nom de la room est deja pris
      // si oui rajouter un chiffre a la fin et reverifier jusqu'a trouver un nom de room libre
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
    // console.log({ uuid: uuid });
    // console.log({ UUIDMapings: this.UUIDMapings.get(uuid) });
    if (this._playerWaiting.length === 1) {
      player1.setIsMaster(true);

      socket.emit('waitToPlay', { roomId: this.room_name, name: name });
      // socket.emit('new-person', { uuid: uuid, name: name });
      // console.log({ uuidMapping: this.UUIDMapings });
      // console.log({ playerWaiting: this._playerWaiting });
      // console.log("je suis arriver jusqu'ici");
    } else if (this._playerWaiting.length === 2) {
      socket.emit('waitToPlay', { roomId: this.room_name, name: name });
      this.startGame();
      this.room_name = '';
      this._playerWaiting = [];
    }
  }
}
