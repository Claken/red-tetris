import { Server } from 'socket.io';
import { Player } from '../player/player';
import { ClientInfo } from '../../interfaces/clientInfo';
import { MULTI, SINGLE } from '../../constantes/constantes';
import { ManagePlayerTetromino } from '../managePlayerTetromino/managePlayerTetromino';

export class Game {
  private _players: Player[];
  private _playersLost: Player[] = [];
  private _waitingPlayers: Player[] = [];
  private _isStarted = false;
  private _isStarting = false;
  private _initialPlayerCount = 0;
  private _roomId: string;
  private _type: number;
  private _server: Server;
  constructor(players: Player[], roomId: string, type: number, server: Server) {
    this._players = players;
    this._roomId = roomId;
    this._type = type;
    this._server = server;
  }

  public getLostPlayers(): Player[] {
    return this._playersLost;
  }


  public getWaitingPlayers(): Player[] {
    return this._waitingPlayers;
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

  public getIsStarting(): boolean {
    return this._isStarting;
  }

  public setIsStarting(val: boolean): void {
    this._isStarting = val;
  }

  public getInitialPlayerCount(): number {
    return this._initialPlayerCount;
  }


  public removeLostPlayer(playerUuid: string): void {
    this._playersLost = this._playersLost.filter(
      (player) => player.getUuid() != playerUuid,
    );
  }


  public removePlayer(playerUuid: string): void {
    this._players = this._players.filter(
      (player) => player.getUuid() != playerUuid,
    );
  }


  public addWaitingPlayer(player: Player): void {
    this._waitingPlayers.push(player);
  }

  public removeWaitingPlayer(playerUuid: string): void {
    this._waitingPlayers = this._waitingPlayers.filter(
      (player) => player.getUuid() != playerUuid,
    );
  }

  public removePlayerFromAll(playerUuid: string): void {
    this.removePlayer(playerUuid);
    this.removeLostPlayer(playerUuid);
    this.removeWaitingPlayer(playerUuid);
  }

  public isEmpty(): boolean {
    return (
      this._players.length === 0 &&
      this._playersLost.length === 0 &&
      this._waitingPlayers.length === 0
    );
  }


  public changePlayerToWaiting(playerUuid: string): void {
    const player = this._players.find(
      (player) => player.getUuid() == playerUuid,
    );
    if (player != undefined) {
      this._waitingPlayers.push(player);
      this._players = this._players.filter(
        (player) => player.getUuid() != playerUuid,
      );
    } else if (player == undefined) {
      const playerLost = this._playersLost.find(
        (player) => player.getUuid() == playerUuid,
      );
      if (playerLost != undefined) {
        this._waitingPlayers.push(playerLost);
        this._playersLost = this._playersLost.filter(
          (player) => player.getUuid() != playerUuid,
        );
      }
    }
  }


  public moveRight(playerUuid: string, socketId: string[]): void {
    const player: Player | undefined = this._players.find(
      (player) => player.getUuid() == playerUuid,
    );
    if (player != undefined) {
      player.moveRightTetromino();
      const listSpectrum: any = this._players
        .filter((elem) => elem.getUuid() != player.getUuid())
        .map((elem) => {
          return { name: elem.getPlayerName(), spectrum: elem.getSpectrum() };
        });
      this.sendGameToClient(player, socketId, listSpectrum);
    }
  }


  public moveLeft(playerUuid: string, socketId: string[]): void {
    const player: Player | undefined = this._players.find(
      (player) => player.getUuid() == playerUuid,
    );
    if (player != undefined) {
      player.moveLeftTetromino();
      const listSpectrum: any = this._players
        .filter((elem) => elem.getUuid() != player.getUuid())
        .map((elem) => {
          return { name: elem.getPlayerName(), spectrum: elem.getSpectrum() };
        });
      this.sendGameToClient(player, socketId, listSpectrum);
    }
  }


  public rotate(playerUuid: string, socketId: string[]): void {
    const player: Player | undefined = this._players.find(
      (player) => player.getUuid() == playerUuid,
    );
    if (player != undefined) {
      player.rotateTetromino();
      const listSpectrum: any = this._players
        .filter((elem) => elem.getUuid() != player.getUuid())
        .map((elem) => {
          return { name: elem.getPlayerName(), spectrum: elem.getSpectrum() };
        });
      this.sendGameToClient(player, socketId, listSpectrum);
    }
  }


  public moveDown(playerUuid: string, socketId: string[]): void {
    const player: Player | undefined = this._players.find(
      (player) => player.getUuid() == playerUuid,
    );
    if (player != undefined) {
      player.moveDownTetromino();
      const listSpectrum: any = this._players
        .filter((elem) => elem.getUuid() != player.getUuid())
        .map((elem) => {
          return { name: elem.getPlayerName(), spectrum: elem.getSpectrum() };
        });
      this.sendGameToClient(player, socketId, listSpectrum);
    }
  }


  public fallDown(playerUuid: string, socketId: string[]): void {
    const player: Player | undefined = this._players.find(
      (player) => player.getUuid() == playerUuid,
    );
    if (player != undefined) {
      const nbLine = player.fallTetromino();
      if (nbLine != undefined && nbLine > 0) {
        for (let i = 0; i < this._players.length; i++) {
          if (this._players[i].getUuid() != player.getUuid()) {
            this._players[i].addLine(nbLine);
          }
        }
      }
      player.updateSpectrum();
      const listSpectrum: any = this._players
        .filter((elem) => elem.getUuid() != player.getUuid())
        .map((elem) => {
          return { name: elem.getPlayerName(), spectrum: elem.getSpectrum() };
        });
      this.sendGameToClient(player, socketId, listSpectrum);
    }
  }


  async startGame(UUIDMapings: Map<string, ClientInfo>): Promise<void> {
    this.setIsStarted(true);
    this._isStarting = false;
    if (this._type === MULTI) {
      this._initialPlayerCount = this._waitingPlayers.length;
      this._players = this._waitingPlayers;
      this._waitingPlayers = [];
    } else {
      this._initialPlayerCount = this._players.length;
    }
    const promises = this._players.map((player) => {
      return this.sendCounterToClient(
        player,
        UUIDMapings.get(player.getUuid())?.socketsId ?? [],
      );
    });
    await Promise.all(promises);
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


  public async gamePlayMulti(UUIDMapings: Map<string, ClientInfo>) {
    for (let i = 0; i < this._players.length; i++) {
      this._players[i].moveDownTetromino();
      if (this._players[i].getToken() == 0) {
        const nbLine = this._players[i].updateGrid(0);
        if (nbLine.nbrLineToAdd > 0) {
          for (let j = 0; j < this._players.length; j++) {
            if (this._players[j].getUuid() != this._players[i].getUuid()) {
              this._players[j].addLine(nbLine.nbrLineToAdd);
            }
          }
        }
      }
      if (this._players[i].getToken() == 1) {
        this._players[i].setToken(0);
      }
      this._players[i].updateSpectrum();
      const listSpectrum: any = this._players
        .filter((elem) => elem.getUuid() != this._players[i].getUuid())
        .map((elem) => {
          return { name: elem.getPlayerName(), spectrum: elem.getSpectrum() };
        });
      this.sendGameToClient(
        this._players[i],
        UUIDMapings.get(this._players[i].getUuid())?.socketsId ?? [],
        listSpectrum,
      );
    }
  }


  public endGame(UUIDMapings: Map<string, ClientInfo>): boolean {
    if (this._type === SINGLE) {
      if (this._players[0].isPlayerLost()) {
        this._server.to(this._roomId).emit('endGame', {
          player: {
            grid: this._players[0].getGrid(),
            name: this._players[0].getPlayerName(),
            uuid: this._players[0].getUuid(),
            roomId: this._roomId,
            type: this._type,
            winner: false,
          },
        });
        this.setIsStarted(false);
        return true;
      }
    } else if (this._type === MULTI && this._initialPlayerCount === 1) {
      // Solo in a room: same as SINGLE but emit to player's sockets
      if (this._players[0].isPlayerLost()) {
        const socketIds =
          UUIDMapings.get(this._players[0].getUuid())?.socketsId ?? [];
        this._server.to(socketIds).emit('endGame', {
          player: {
            grid: this._players[0].getGrid(),
            name: this._players[0].getPlayerName(),
            uuid: this._players[0].getUuid(),
            roomId: this._roomId,
            type: this._type,
            winner: false,
          },
        });
        this.setIsStarted(false);
        return true;
      }
    } else {
      for (let i = 0; i < this._players.length; i++) {
        if (this._players[i].isPlayerLost()) {
          this._players[i].setGridToZero();
          this._players[i].setTetrominosToZero();
          this._playersLost.push(this._players[i]);
          const socketIds =
            UUIDMapings.get(this._players[i].getUuid())?.socketsId ?? [];
          this._players.splice(i, 1);
          this._server.to(socketIds).emit('endGame', {
            player: {
              grid: this._playersLost[this._playersLost.length - 1].getGrid(),
              name: this._playersLost[
                this._playersLost.length - 1
              ].getPlayerName(),
              uuid: this._playersLost[this._playersLost.length - 1].getUuid(),
              roomId: this._roomId,
              type: this._type,
              winner: false,
            },
          });
          i = -1;
        }
      }
      if (this._players.length === 1) {
        this._players[0].setGridToZero();
        this._players[0].setTetrominosToZero();
        const socketIds =
          UUIDMapings.get(this._players[0].getUuid())?.socketsId ?? [];
        this._server.to(socketIds).emit('endGame', {
          player: {
            grid: this._players[0].getGrid(),
            name: this._players[0].getPlayerName(),
            uuid: this._players[0].getUuid(),
            roomId: this._roomId,
            type: this._type,
            winner: true,
          },
        });
        this.setIsStarted(false);
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
          this._server.to(socketId).emit('beforeGame', {
            player: {
              grid: player.getGrid(),
              name: player.getPlayerName(),
              uuid: player.getUuid(),
              roomId: this._roomId,
              tetrominos: player.getTetrominos().slice(1, 6),
              type: this._type,
            },
          });
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
          clearInterval(intervalId);
          resolve();
        }
      }, 1000); // update every second
    });
  }


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


  public sendGameToClient(
    player: Player,
    socketId: string[],
    listSpectrum?: any,
  ): void {
    if (this._type == SINGLE) {
      this._server.to(this._roomId).emit('myGame', {
        player: {
          grid: player.getGrid(),
          name: player.getPlayerName(),
          uuid: player.getUuid(),
          roomId: this._roomId,
          tetrominos: player.getTetrominos().slice(1, 6),
          type: this._type,
        },
      });
      return;
    }
    if (socketId.length === 0) {
      return;
    }
    this._server.to(socketId).emit('myGame', {
      listSpectrum: listSpectrum,
      player: {
        grid: player.getGrid(),
        name: player.getPlayerName(),
        uuid: player.getUuid(),
        roomId: this._roomId,
        tetrominos: player.getTetrominos().slice(1, 6),
        type: this._type,
      },
    });
  }
}
