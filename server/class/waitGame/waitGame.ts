import { Server } from 'socket.io';
import { Game } from '../game/game';
import { ClientInfo } from '../../interfaces/clientInfo';
import { Player } from '../player/player';
import { ManagePlayerTetromino } from '../managePlayerTetromino/managePlayerTetromino';

export class WaitGame {
  private static _instance: WaitGame;
  private _server: Server;
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
      'room_id',
      this._playerWaiting[0],
      this._playerWaiting[1],
      this._server,
    );
    game.startGame();
  }
  public addPlayer(uuid: string): void {
    // check if the player is already in the waiting list
    // uuid recupere le socket.id et le nom du joueur qui se trouve dans le socketManager
    if (this._playerWaiting.find((player) => player.getUuid() === uuid)) {
      return;
    }
    const player1 = new Player(uuid, 'player1');
    this._playerWaiting.push(player1);
    if (this.UUIDMapings.has(uuid)) {
      // checker dans clientInfo si un le nom de la room est deja pris
      // si oui rajouter un chiffre a la fin et reverifier jusqu'a trouver un nom de room libre
      const val = this.UUIDMapings.get(uuid);
      // val.room_id = val.room_id + 1;
      let name = player1.getPlayerName();
      while (val?.room_id.find((room) => room === name)) {
        name = name + 1;
      }
      val?.room_id.push(name);
      if (val) {
        val.socketId = ['fdf'];
      }
    } else {
      this.UUIDMapings.set(uuid, {
        socketId: ['fjdkf'],
        room_id: ['player1'],
        name: 'player1',
      });
    }
    if (this._playerWaiting.length === 1) {
      player1.setIsMaster(true);
    } else if (this._playerWaiting.length === 2) {
      this.startGame();
      this._playerWaiting = [];
    }
  }
}
