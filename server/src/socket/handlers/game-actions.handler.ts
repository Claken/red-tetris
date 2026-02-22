import { Socket } from 'socket.io';
import type { ClientInfo } from '../../../interfaces/clientInfo';
import type { HandlerContext } from '../handler-context';

export function registerGameActionsHandlers(socket: Socket, ctx: HandlerContext): void {
  const { waitGame, isValidData } = ctx;

  socket.on('moveRight', (data) => {
    if (!isValidData(data, 'uuid', 'roomId')) return;
    const infos: ClientInfo | undefined = waitGame.getUUIDMapings().get(data.uuid);
    if (infos == undefined) return;
    const game = waitGame.getGames().get(data.roomId);
    if (game == undefined) return;
    game.moveRight(data.uuid, infos.socketsId);
  });

  socket.on('moveLeft', (data) => {
    if (!isValidData(data, 'uuid', 'roomId')) return;
    const infos: ClientInfo | undefined = waitGame.getUUIDMapings().get(data.uuid);
    if (infos == undefined) return;
    const game = waitGame.getGames().get(data.roomId);
    if (game == undefined) return;
    game.moveLeft(data.uuid, infos.socketsId);
  });

  socket.on('rotate', (data) => {
    if (!isValidData(data, 'uuid', 'roomId')) return;
    const infos: ClientInfo | undefined = waitGame.getUUIDMapings().get(data.uuid);
    if (infos == undefined) return;
    const game = waitGame.getGames().get(data.roomId);
    if (game == undefined) return;
    game.rotate(data.uuid, infos.socketsId);
  });

  socket.on('moveDown', (data) => {
    if (!isValidData(data, 'uuid', 'roomId')) return;
    const infos: ClientInfo | undefined = waitGame.getUUIDMapings().get(data.uuid);
    if (infos == undefined) return;
    const game = waitGame.getGames().get(data.roomId);
    if (game == undefined) return;
    game.moveDown(data.uuid, infos.socketsId);
  });

  socket.on('fallDown', (data) => {
    if (!isValidData(data, 'uuid', 'roomId')) return;
    const infos: ClientInfo | undefined = waitGame.getUUIDMapings().get(data.uuid);
    if (infos == undefined) return;
    const game = waitGame.getGames().get(data.roomId);
    if (game == undefined) return;
    game.fallDown(data.uuid, infos.socketsId);
  });
}
