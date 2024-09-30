import { Server } from 'socket.io';
import { Player } from '../player/player';

export class Game {
  private _player1: Player;
  private _player2: Player;
  private _room_id: string;
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

  public moveRight(playerUuid: string): void {
    if (playerUuid == this._player1.getUuid()) {
      this._player1.moveRightTetromino();
    } else if (playerUuid == this._player2.getUuid()) {
      this._player2.moveRightTetromino();
    }
    this.sendGameToClient();
  }

  public moveLeft(playerUuid: string): void {
    if (playerUuid == this._player1.getUuid()) {
      this._player1.moveLeftTetromino();
    } else if (playerUuid == this._player2.getUuid()) {
      this._player2.moveLeftTetromino();
    }
    this.sendGameToClient();
  }

  public rotate(playerUuid: string): void {
    if (playerUuid == this._player1.getUuid()) {
      this._player1.rotateTetromino();
    } else if (playerUuid == this._player2.getUuid()) {
      this._player2.rotateTetromino();
    }
    this.sendGameToClient();
  }

  public moveDown(playerUuid: string): void {
    if (playerUuid == this._player1.getUuid()) {
      this._player1.moveDownTetromino();
    } else if (playerUuid == this._player2.getUuid()) {
      this._player2.moveDownTetromino();
    }
    this.sendGameToClient();
  }

  public fallDown(playerUuid: string): void {
    if (playerUuid == this._player1.getUuid()) {
      this._player1.fallTetromino();
    } else if (playerUuid == this._player2.getUuid()) {
      this._player2.fallTetromino();
    }
    this.sendGameToClient();
  }

  getControlGame(): Player {
    return this._player1.getIsMaster() ? this._player1 : this._player2;
  }
  async sendCounterToClient(): Promise<void> {
    const countdownTime = 4;
    let currentTime = countdownTime;
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (currentTime == 4) {
          this._server.to(this._room_id).emit('changePage');
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
          currentTime--;
        } else if (currentTime > 0) {
          this._server.to(this._room_id).emit('countdown', {
            currentTime: currentTime,
            roomId: this._room_id,
          });
          currentTime--;
        } else {
          // count down is over we can start the game
          this._server.to(this._room_id).emit('countdown', {
            currentTime: currentTime,
            roomId: this._room_id,
          });
          clearInterval(intervalId);
          resolve();
        }
      }, 1000); // update every second
    });
  }

  async startGame(): Promise<void> {
    await this.sendCounterToClient();
    this._player1.initTetrominoInsideGrid();
    this._player2.initTetrominoInsideGrid();
    this.sendGameToClient();
    const intervalId = setInterval(() => {
      this._player1.moveDownTetromino();
      this._player2.moveDownTetromino();
      this._player1.updateGrid();
      this._player2.updateGrid();
      this.sendGameToClient();
      if (this.endGame()) {
        clearInterval(intervalId);
        console.log('end game');
      }
    }, 1000); // update every second
  }

  actionGame(playerUuid: string, action: string): void {
    if (playerUuid == this._player1.getUuid()) {
      this._player1.action(action);
    } else if (playerUuid == this._player2.getUuid()) {
      this._player2.action(action);
    }
    this.sendGameToClient();
  }

  endGame(): boolean {
    if (this._player1.isPlayerLost() || this._player2.isPlayerLost()) {
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
    }
    return false;
  }
  private sendGameToClient(): void {
    // send the five first pieces to the client
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
  }
}
