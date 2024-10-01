import { Server } from 'socket.io';
import { Player } from '../player/player';
import { SINGLE, MULTI } from '../../constantes/constantes';

export class Game {
  private _player1: Player;
  private _player2: Player | undefined;
  private _room_id: string;
  private _server: Server;
  private _type: number;
  constructor(
    room_id: string,
    server: Server,
    player1: Player,
    player2: Player | undefined,
  ) {
    this._room_id = room_id;
    this._player1 = player1;
    this._type = player2 == undefined ? SINGLE : MULTI;
    this._player2 = player2;
    this._server = server;
  }

  public getPlayer1(): Player {
    return this._player1;
  }
  public getPlayer2(): Player | undefined {
    return this._player2;
  }

  public haveToReloadTetrominos(): boolean {
    if (
      (this._player1 !== undefined &&
        this._player1.getTetrominos().length < 90) ||
      (this._player2 !== undefined && this._player2.getTetrominos().length < 90)
    ) {
      return true;
    }
    return false;
  }
  public moveRight(playerUuid: string): void {
    if (playerUuid == this._player1.getUuid()) {
      this._player1.moveRightTetromino();
    } else if (
      this._type == MULTI &&
      this._player2 != undefined &&
      playerUuid == this._player2.getUuid()
    ) {
      this._player2.moveRightTetromino();
    }
    this.sendGameToClient();
  }

  public moveLeft(playerUuid: string): void {
    if (playerUuid == this._player1.getUuid()) {
      this._player1.moveLeftTetromino();
    } else if (
      this._type == MULTI &&
      this._player2 != undefined &&
      playerUuid == this._player2.getUuid()
    ) {
      this._player2.moveLeftTetromino();
    }
    this.sendGameToClient();
  }

  public rotate(playerUuid: string): void {
    if (playerUuid == this._player1.getUuid()) {
      this._player1.rotateTetromino();
    } else if (
      this._type == MULTI &&
      this._player2 != undefined &&
      playerUuid == this._player2.getUuid()
    ) {
      this._player2.rotateTetromino();
    }
    this.sendGameToClient();
  }

  public moveDown(playerUuid: string): void {
    if (playerUuid == this._player1.getUuid()) {
      this._player1.moveDownTetromino();
    } else if (
      this._type == MULTI &&
      this._player2 != undefined &&
      playerUuid == this._player2.getUuid()
    ) {
      this._player2.moveDownTetromino();
    }
    this.sendGameToClient();
  }

  public fallDown(playerUuid: string): void {
    if (playerUuid == this._player1.getUuid()) {
      this._player1.fallTetromino();
    } else if (
      this._type == MULTI &&
      this._player2 != undefined &&
      playerUuid == this._player2.getUuid()
    ) {
      this._player2.fallTetromino();
    }
    this.sendGameToClient();
  }

  getControlGame(): Player {
    if (this._player2 == undefined) {
      return this._player1;
    }
    return this._player1.getIsMaster() ? this._player1 : this._player2;
  }
  async sendCounterToClient(): Promise<void> {
    const countdownTime = 4;
    let currentTime = countdownTime;
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (currentTime == 4) {
          if (this._player2 != undefined) {
            this._server.to(this._room_id).emit('beforeGame', {
              player1: {
                grid: this._player1.getGrid(),
                name: this._player1.getPlayerName(),
                uuid: this._player1.getUuid(),
                roomId: this._room_id,
                tetrominos: this._player1.getTetrominos().slice(0, 5),
              },
              player2: {
                grid: this._player2.getGrid(),
                name: this._player2.getPlayerName(),
                uuid: this._player2.getUuid(),
                roomId: this._room_id,
                tetrominos: this._player2.getTetrominos().slice(0, 5),
              },
            });
          } else {
            this._server.to(this._room_id).emit('beforeGame', {
              player1: {
                grid: this._player1.getGrid(),
                name: this._player1.getPlayerName(),
                uuid: this._player1.getUuid(),
                roomId: this._room_id,
                tetrominos: this._player1.getTetrominos().slice(0, 5),
              },
            });
          }
          currentTime--;
        } else if (currentTime > 0) {
          this._server.to(this._room_id).emit('countdown', {
            currentTime: currentTime,
            roomId: this._room_id,
          });
          currentTime--;
        } else {
          // count down is over we can start the game
          clearInterval(intervalId);
          resolve();
        }
      }, 1000); // update every second
    });
  }

  gamePlay(touch: any): void {
    const nbrLine = this._player1.updateGrid(touch.touch1);
    if (this._player2 != undefined) {
      const nbrLine2 = this._player2.updateGrid(touch.touch2);
      this._player1.addLine(nbrLine2.nbrLineToAdd);
      this._player2.addLine(nbrLine.nbrLineToAdd);
      this._player2.moveDownTetromino();
      touch.touch2 = nbrLine2.touched;
    }
    this._player1.moveDownTetromino();
    touch.touch1 = nbrLine.touched;
    // console.log({ touch1: touch.touch1, touch2: touch.touch2 });
    this.sendGameToClient();
  }

  async startGame(): Promise<void> {
    await this.sendCounterToClient();
    this._player1.initTetrominoInsideGrid();
    if (this._player2 != undefined) this._player2.initTetrominoInsideGrid();
    this.sendGameToClient();
  }

  actionGame(playerUuid: string, action: string): void {
    if (playerUuid == this._player1.getUuid()) {
      this._player1.action(action);
    } else if (
      this._type == MULTI &&
      this._player2 != undefined &&
      playerUuid == this._player2.getUuid()
    ) {
      this._player2.action(action);
    }
    this.sendGameToClient();
  }

  endGame(): boolean {
    if (
      this._type == MULTI &&
      this._player2 != undefined &&
      (this._player1.isPlayerLost() || this._player2.isPlayerLost())
    ) {
      this._server.to(this._room_id).emit('endGame', {
        player1: {
          grid: this._player1.getGrid(),
          name: this._player1.getPlayerName(),
          uuid: this._player1.getUuid(),
          winner: this._player2.isPlayerLost(),
        },
        player2: {
          grid: this._player2.getGrid(),
          name: this._player2.getPlayerName(),
          uuid: this._player2.getUuid(),
          winner: this._player1.isPlayerLost(),
        },
      });
      return true;
    } else if (
      this._type == SINGLE &&
      this._player2 == undefined &&
      this._player1.isPlayerLost()
    ) {
      this._server.to(this._room_id).emit('endGame', {
        player1: {
          grid: this._player1.getGrid(),
          name: this._player1.getPlayerName(),
          uuid: this._player1.getUuid(),
          winner: true,
        },
      });
      return true;
    }
    return false;
  }
  public sendGameToClient(): void {
    // send the five first pieces to the client
    if (this._type == MULTI && this._player2 != undefined) {
      this._server.to(this._room_id).emit('game', {
        player1: {
          grid: this._player1.getGrid(),
          name: this._player1.getPlayerName(),
          uuid: this._player1.getUuid(),
          roomId: this._room_id,
        },
        player2: {
          grid: this._player2.getGrid(),
          name: this._player2.getPlayerName(),
          uuid: this._player2.getUuid(),
          roomId: this._room_id,
        },
      });
    } else {
      // console.log({ room_id: this._room_id });
      this._server.to(this._room_id).emit('game', {
        player1: {
          grid: this._player1.getGrid(),
          name: this._player1.getPlayerName(),
          uuid: this._player1.getUuid(),
          roomId: this._room_id,
        },
      });
    }
  }
}
