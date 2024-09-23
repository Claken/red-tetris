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

  getControlGame(): Player {
    return this._player1.getIsMaster() ? this._player1 : this._player2;
  }

  async sendCounterToClient(): Promise<void> {
    const countdownTime = 3;
    let currentTime = countdownTime;
    // send the countdown to the client
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (currentTime > 0) {
          // Envoyer le temps restant aux clients
          this._server.to(this._room_id).emit('countdown', currentTime);
          currentTime--;
        } else {
          // count down is over we can start the game
          clearInterval(intervalId);
          this._server.to(this._room_id).emit('startGame', {
            player1: {
              grid: this._player1.getGrid(),
              name: this._player1.getPlayerName(),
              uuid: this._player1.getUuid(),
            },
            player2: {
              grid: this._player2.getGrid(),
              name: this._player2.getPlayerName(),
              uuid: this._player2.getUuid(),
            },
          });
          resolve();
        }
      }, 1000); // update every second
    });
  }

  async startGame(): Promise<void> {
    await this.sendCounterToClient();
    const intervalId = setInterval(() => {
      this._player1.updateGrid();
      this._player2.updateGrid();
      this.sendGameToClient();
    }, 1000); // update every second

    if (this.endGame()) {
      clearInterval(intervalId);
    }
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
      },
      player2: {
        grid: this._player2.getGrid(),
        name: this._player2.getPlayerName(),
        uuid: this._player2.getUuid(),
      },
    });
  }
}
