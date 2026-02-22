import { Socket } from 'socket.io';
import { Game } from '../../../class/game/game';
import { SINGLE, MULTI } from '../../../constantes/constantes';
import type { HandlerContext } from '../handler-context';

export function registerGameLifecycleHandlers(socket: Socket, ctx: HandlerContext): void {
  const { waitGame, manageSocket, isValidData } = ctx;

  socket.on('checkGame', (data) => {
    if (!isValidData(data, 'uuid', 'roomId')) return;
    const infos = manageSocket.getInfos(data.uuid);
    if (infos == undefined) return;

    const game: Game | undefined = waitGame.getGames().get(data.roomId);
    if (game == undefined) {
      socket.emit('noGame');
      return;
    }
    if (game.getType() === SINGLE) {
      const player = game.getPlayers()[0];
      socket.emit('myGame', {
        player: {
          grid: player.getGrid(),
          name: player.getPlayerName(),
          uuid: player.getUuid(),
          roomId: data.roomId,
          tetrominos: player.getTetrominos().slice(1, 6),
          type: game.getType(),
        },
      });
      return;
    }
    if (game.getType() === MULTI && game.getIsStarted() === false) {
      if (game.getLostPlayers().some((elem) => elem.getUuid() === data.uuid)) {
        const lostPlayer = game.getLostPlayers().find((elem) => elem.getUuid() === data.uuid);
        socket.emit('endGame', {
          player: {
            grid: lostPlayer?.getGrid(),
            name: lostPlayer?.getPlayerName(),
            uuid: lostPlayer?.getUuid(),
            roomId: data.roomId,
            tetrominos: lostPlayer?.getTetrominos().slice(1, 6),
            type: game.getType(),
          },
        });
        return;
      }
      const player = game.getPlayers().find((elem) => elem.getUuid() === data.uuid);
      if (game.getPlayers().some((elem) => elem.getUuid() === data.uuid)) {
        socket.emit('endGame', {
          player: {
            grid: player?.getGrid(),
            name: player?.getPlayerName(),
            uuid: player?.getUuid(),
            roomId: data.roomId,
            type: game.getType(),
            winner: true,
          },
        });
        return;
      }
      const playerWaiting = game.getWaitingPlayers().find((elem) => elem.getUuid() === data.uuid);
      if (playerWaiting == undefined) {
        socket.emit('noGame');
      }
    }
  });

  socket.on('getWaitingList', (data) => {
    if (!isValidData(data, 'uuid', 'roomId')) return;
    const infos = manageSocket.getInfos(data.uuid);
    if (infos == undefined) return;
    const game: Game | undefined = waitGame.getGames().get(data.roomId);
    const name = game?.getWaitingPlayers().map((elem) => elem.getPlayerName());
    socket.emit('list_players_room', { roomId: data.roomId, players: name });
  });

  socket.on('notRetryGame', (data) => {
    if (!isValidData(data, 'uuid', 'roomId')) return;
    const infos = manageSocket.getInfos(data.uuid);
    if (infos == undefined) return;
    waitGame.notRetryGame(data.uuid, infos.name, socket.id, data.roomId);
  });

  socket.on('retryGame', (data) => {
    if (!isValidData(data, 'uuid', 'roomId')) return;
    const infos = manageSocket.getInfos(data.uuid);
    if (infos == undefined) return;
    waitGame.retryGame(data.uuid, infos.name, socket.id, data.roomId);
  });

  socket.on('startSingleTetrisGame', (data) => {
    if (!isValidData(data, 'uuid')) return;
    const infos = manageSocket.getInfos(data.uuid);
    if (infos == undefined) return;
    waitGame.startSingleTetrisGame(data.uuid, infos.name, socket.id);
  });

  socket.on('startMultiGame', (data) => {
    if (!isValidData(data, 'uuid', 'roomId')) return;
    const infos = manageSocket.getInfos(data.uuid);
    if (infos == undefined) return;
    waitGame.startMultiTetrisGame(data.uuid, infos.name, socket.id, data.roomId);
  });
}
