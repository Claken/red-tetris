import { Server } from 'socket.io';
import { Player } from '../player/player';
import { ClientInfo } from '../../interfaces/clientInfo';
import { SINGLE } from '../../constantes/constantes';
import { ManagePlayerTetromino } from '../managePlayerTetromino/managePlayerTetromino';

export class Game {
  private _players: Player[];
  private _playersLost: Player[] = [];
  private _waitingPlayers: Player[] = [];
  private _isStarted = false;
  private _roomId: string;
  private _type: number;
  private _server: Server;
  constructor(players: Player[], roomId: string, type: number, server: Server) {
    this._players = players;
    this._roomId = roomId;
    this._type = type;
    this._server = server;
  }
  public getPlayers(): Player[] {
    return this._players;
  }
  public getRoomId(): string {
    return this._roomId;
  }
  public getType(): number {
    return this._type;
  }
  public getIsStarted(): boolean {
    return this._isStarted;
  }

  public setIsStarted(val: boolean): void {
    this._isStarted = val;
  }

  public addWaitingPlayer(player: Player): void {
    this._waitingPlayers.push(player);
  }

  public moveRight(playerUuid: string, socketId: string[]): void {
    const player: Player | undefined = this._players.find(
      (player) => player.getUuid() == playerUuid,
    );
    if (player != undefined) {
      player.moveRightTetromino();
      this.sendGameToClient(player, socketId);
    }
  }
  public moveLeft(playerUuid: string, socketId: string[]): void {
    const player: Player | undefined = this._players.find(
      (player) => player.getUuid() == playerUuid,
    );
    if (player != undefined) {
      player.moveLeftTetromino();
      this.sendGameToClient(player, socketId);
    }
  }
  public rotate(playerUuid: string, socketId: string[]): void {
    const player: Player | undefined = this._players.find(
      (player) => player.getUuid() == playerUuid,
    );
    if (player != undefined) {
      player.rotateTetromino();
      this.sendGameToClient(player, socketId);
    }
  }
  public moveDown(playerUuid: string, socketId: string[]): void {
    const player: Player | undefined = this._players.find(
      (player) => player.getUuid() == playerUuid,
    );
    if (player != undefined) {
      player.moveDownTetromino();
      this.sendGameToClient(player, socketId);
    }
  }
  public fallDown(playerUuid: string, socketId: string[]): void {
    const player: Player | undefined = this._players.find(
      (player) => player.getUuid() == playerUuid,
    );
    if (player != undefined) {
      player.fallTetromino();
      this.sendGameToClient(player, socketId);
    }
  }

  async startGame(UUIDMapings: Map<string, ClientInfo>): Promise<void> {
    this.setIsStarted(true);
    for (let i = 0; i < this._players.length; i++) {
      await this.sendCounterToClient(
        this._players[i],
        UUIDMapings.get(this._players[i].getUuid())?.socketsId ?? [],
      );
    }
    const managePT = new ManagePlayerTetromino();
    managePT.injectmultipleTetrominos(this._players, 100);
    for (let i = 0; i < this._players.length; i++) {
      this._players[i].initTetrominoInsideGrid();
      this.sendGameToClient(
        this._players[i],
        UUIDMapings.get(this._players[i].getUuid())?.socketsId ?? [],
      );
    }
  }

  public endGame(): boolean {
    if (this._type === SINGLE) {
      if (this._players[0].isPlayerLost()) {
        console.log('player lost');
        console.log({ roomId: this._roomId });
        this._server.to(this._roomId).emit('endGame', {
          player: {
            grid: this._players[0].getGrid(),
            name: this._players[0].getPlayerName(),
            uuid: this._players[0].getUuid(),
            roomId: this._roomId,
            winner: false,
          },
        });
        return true;
      }
    }
    return false;
  }

  public async sendCounterToClient(
    player: Player,
    socketId: string[],
  ): Promise<void> {
    const countdownTime = 4;
    let currentTime = countdownTime;
    return await new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (currentTime == 4) {
          if (this._type !== SINGLE) {
            this._server.to(this._roomId).emit('beforeGame', {
              player: {
                grid: player.getGrid(),
                name: player.getPlayerName(),
                uuid: player.getUuid(),
                roomId: this._roomId,
                tetrominos: player.getTetrominos().slice(0, 6),
              },
            });
          } else {
            this._server.to(socketId).emit('beforeGame', {
              player: {
                grid: player.getGrid(),
                name: player.getPlayerName(),
                uuid: player.getUuid(),
                roomId: this._roomId,
                tetrominos: player.getTetrominos().slice(0, 6),
              },
            });
          }
          currentTime--;
        } else if (currentTime >= 0) {
          if (this._type === SINGLE) {
            this._server.to(this._roomId).emit('countdown', {
              currentTime: currentTime,
              roomId: this._roomId,
            });
          } else {
            this._server.to(socketId).emit('countdown', {
              currentTime: currentTime,
              roomId: this._roomId,
            });
          }
          currentTime--;
        } else {
          // count down is over we can start the game
          // this._server.to(this._room_id).emit('countdown', {
          //   currentTime: currentTime,
          //   roomId: this._room_id,
          // });
          clearInterval(intervalId);
          resolve();
        }
      }, 1000); // update every second
    });
  }

  // getControlGame(): Player {
  //   if (this._player2 == undefined) {
  //     return this._player1;
  //   }
  //   return this._player1.getIsMaster() ? this._player1 : this._player2;
  // }
  // async sendCounterToClient(): Promise<void> {
  //   const countdownTime = 4;
  //   let currentTime = countdownTime;
  //   return new Promise((resolve) => {
  //     const intervalId = setInterval(() => {
  //       if (currentTime == 4) {
  //         if (this._player2 != undefined) {
  //           this._server.to(this._room_id).emit('beforeGame', {
  //             player1: {
  //               grid: this._player1.getGrid(),
  //               name: this._player1.getPlayerName(),
  //               uuid: this._player1.getUuid(),
  //               roomId: this._room_id,
  //               tetrominos: this._player1.getTetrominos().slice(0, 5),
  //             },
  //             player2: {
  //               grid: this._player2.getGrid(),
  //               name: this._player2.getPlayerName(),
  //               uuid: this._player2.getUuid(),
  //               roomId: this._room_id,
  //               tetrominos: this._player2.getTetrominos().slice(0, 5),
  //             },
  //           });
  //         } else {
  //           this._server.to(this._room_id).emit('beforeGame', {
  //             player1: {
  //               grid: this._player1.getGrid(),
  //               name: this._player1.getPlayerName(),
  //               uuid: this._player1.getUuid(),
  //               roomId: this._room_id,
  //               tetrominos: this._player1.getTetrominos().slice(0, 5),
  //             },
  //           });
  //         }
  //         currentTime--;
  //       } else if (currentTime > 0) {
  //         this._server.to(this._room_id).emit('countdown', {
  //           currentTime: currentTime,
  //           roomId: this._room_id,
  //         });
  //         currentTime--;
  //       } else {
  //         // count down is over we can start the game
  //         clearInterval(intervalId);
  //         resolve();
  //       }
  //     }, 1000); // update every second
  //   });
  // }
  // gamePlay(touch: any): void {
  //   const nbrLine = this._player1.updateGrid(touch.touch1);
  //   if (this._player2 != undefined) {
  //     const nbrLine2 = this._player2.updateGrid(touch.touch2);
  //     this._player1.addLine(nbrLine2.nbrLineToAdd);
  //     this._player2.addLine(nbrLine.nbrLineToAdd);
  //     this._player2.moveDownTetromino();
  //     touch.touch2 = nbrLine2.touched;
  //   }
  //   this._player1.moveDownTetromino();
  //   touch.touch1 = nbrLine.touched;
  //   // console.log({ touch1: touch.touch1, touch2: touch.touch2 });
  //   this.sendGameToClient();
  // }

  public gamePlay(player: Player, touch: any, socketId: string[]): void {
    if (this._type === SINGLE) {
      if (player.getTetrominos().length < 90) {
        const managePT = new ManagePlayerTetromino();
        managePT.injectmultipleTetrominos([player], 10);
      }
      const nbrLine = player.updateGrid(touch.touch1);
      player.moveDownTetromino();
      touch.touch1 = nbrLine.touched;
      this.sendGameToClient(player, socketId);
    }
  }

  // actionGame(playerUuid: string, action: string): void {
  //   if (playerUuid == this._player1.getUuid()) {
  //     this._player1.action(action);
  //   } else if (
  //     this._type == MULTI &&
  //     this._player2 != undefined &&
  //     playerUuid == this._player2.getUuid()
  //   ) {
  //     this._player2.action(action);
  //   }
  //   this.sendGameToClient();
  // }
  // endGame(): boolean {
  //   if (
  //     this._type == MULTI &&
  //     this._player2 != undefined &&
  //     (this._player1.isPlayerLost() || this._player2.isPlayerLost())
  //   ) {
  //     this._server.to(this._room_id).emit('endGame', {
  //       player1: {
  //         grid: this._player1.getGrid(),
  //         name: this._player1.getPlayerName(),
  //         uuid: this._player1.getUuid(),
  //         winner: this._player2.isPlayerLost(),
  //       },
  //       player2: {
  //         grid: this._player2.getGrid(),
  //         name: this._player2.getPlayerName(),
  //         uuid: this._player2.getUuid(),
  //         winner: this._player1.isPlayerLost(),
  //       },
  //     });
  //     return true;
  //   } else if (
  //     this._type == SINGLE &&
  //     this._player2 == undefined &&
  //     this._player1.isPlayerLost()
  //   ) {
  //     this._server.to(this._room_id).emit('endGame', {
  //       player1: {
  //         grid: this._player1.getGrid(),
  //         name: this._player1.getPlayerName(),
  //         uuid: this._player1.getUuid(),
  //         winner: true,
  //       },
  //     });
  //     return true;
  //   }
  //   return false;
  // }
  public sendGameToClient(player: Player, socketId: string[]): void {
    if (this._type == SINGLE) {
      this._server.to(this._roomId).emit('myGame', {
        player: {
          grid: player.getGrid(),
          name: player.getPlayerName(),
          uuid: player.getUuid(),
          roomId: this._roomId,
          tetrominos: player.getTetrominos().slice(0, 6),
        },
      });
      return;
    }
    this._server.to(socketId).emit('myGame', {
      player: {
        grid: player.getGrid(),
        name: player.getPlayerName(),
        uuid: player.getUuid(),
        roomId: this._roomId,
        tetrominos: player.getTetrominos().slice(0, 6),
      },
    });
  }

  // public haveToReloadTetrominos(): boolean {
  //   if (
  //     (this._player1 !== undefined &&
  //       this._player1.getTetrominos().length < 90) ||
  //     (this._player2 !== undefined && this._player2.getTetrominos().length < 90)
  //   ) {
  //     return true;
  //   }
  //   return false;
  // }
}
