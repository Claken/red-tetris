import { Server } from 'socket.io';
import { Player } from '../player/player';

export class Game {
  private _player1: Player;
  private _player2: Player;
  private _room_id: string;
  private _type: string;
  private _server: Server;
  constructor(
    room_id: string,
    player1: Player,
    player2: Player,
    server: Server,
  ) {
    this._room_id = room_id;
    this._player1 = player1;
    this._player2 = player2;
    this._server = server;
  }

  getControlGame(): void {}
  startGame(): void {}
  endGame(): void {}
  addNewPlayer(): void {}
  sendGameToClient(): void {}
}
