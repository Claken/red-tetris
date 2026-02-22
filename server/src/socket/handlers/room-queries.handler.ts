import { Socket } from 'socket.io';
import { MULTI } from '../../../constantes/constantes';
import type { HandlerContext } from '../handler-context';

export function registerRoomQueriesHandlers(socket: Socket, ctx: HandlerContext): void {
  const { waitGame, manageSocket } = ctx;

  socket.on('getActiveRooms', (data) => {
    if (data == undefined || data.uuid == undefined) return;
    const infos = waitGame.getUUIDMapings().get(data.uuid);
    if (infos == undefined) return;
    if (!infos.socketsId.some((elem) => elem === socket.id)) {
      infos.socketsId.push(socket.id);
    }
    const activeRooms = [];
    for (let i = 0; i < infos.ownedRoomsId.length; i++) {
      socket.join(infos.ownedRoomsId[i]);
      const game = waitGame.getGames().get(infos.ownedRoomsId[i]);
      if (game?.getIsStarted()) {
        const isLost = game.getLostPlayers().some((p) => p.getUuid() === data.uuid);
        if (!isLost) {
          activeRooms.push(infos.ownedRoomsId[i]);
        }
      }
    }
    for (let i = 0; i < infos.otherRoomsId.length; i++) {
      socket.join(infos.otherRoomsId[i]);
      const game = waitGame.getGames().get(infos.otherRoomsId[i]);
      if (game?.getIsStarted()) {
        const isLost = game.getLostPlayers().some((p) => p.getUuid() === data.uuid);
        if (!isLost) {
          activeRooms.push(infos.otherRoomsId[i]);
        }
      }
    }
    socket.emit('getActiveRooms', { activeRooms });
  });

  socket.on('getCreateRooms', (data) => {
    if (data == undefined || data.uuid == undefined) return;
    const infos = waitGame.getUUIDMapings().get(data.uuid);
    if (infos == undefined) return;
    if (!infos.socketsId.some((elem) => elem === socket.id)) {
      infos.socketsId.push(socket.id);
    }
    const createRooms = [];
    for (let i = 0; i < infos.ownedRoomsId.length; i++) {
      socket.join(infos.ownedRoomsId[i]);
      if (
        waitGame.getGames().get(infos.ownedRoomsId[i])?.getType() === MULTI &&
        !waitGame.getGames().get(infos.ownedRoomsId[i])?.getIsStarted()
      ) {
        createRooms.push(infos.ownedRoomsId[i]);
      }
    }
    for (let i = 0; i < infos.otherRoomsId.length; i++) {
      socket.join(infos.otherRoomsId[i]);
    }
    socket.emit('getCreateRooms', { createRooms });
  });

  socket.on('getOtherRooms', (data) => {
    if (data == undefined || data.uuid == undefined) return;
    const infosPlayer = manageSocket.getInfos(data.uuid);
    if (infosPlayer == undefined) return;
    const games = waitGame.getGames();
    const infos = waitGame.getUUIDMapings().get(data.uuid);
    const otherRooms = [];
    for (const [, value] of games) {
      if (
        value.getType() === MULTI &&
        (infos == undefined ||
          (!infos.ownedRoomsId.some((elem) => elem === value.getRoomId()) &&
            !infos.otherRoomsId.some((elem) => elem === value.getRoomId())))
      ) {
        otherRooms.push({
          roomId: value.getRoomId(),
          isStarted: value.getIsStarted(),
        });
      }
    }
    socket.emit('getOtherRooms', { otherRooms });
  });

  socket.on('getOthersRoomsJoined', (data) => {
    if (data == undefined || data.uuid == undefined) return;
    const infos = waitGame.getUUIDMapings().get(data.uuid);
    if (infos == undefined) return;
    if (!infos.socketsId.some((elem) => elem === socket.id)) {
      infos.socketsId.push(socket.id);
    }
    const roomsJoined = [];
    for (let i = 0; i < infos.otherRoomsId.length; i++) {
      socket.join(infos.otherRoomsId[i]);
      if (
        waitGame.getGames().get(infos.otherRoomsId[i])?.getType() === MULTI &&
        !waitGame.getGames().get(infos.otherRoomsId[i])?.getIsStarted()
      ) {
        roomsJoined.push(infos.otherRoomsId[i]);
      }
    }
    for (let i = 0; i < infos.ownedRoomsId.length; i++) {
      socket.join(infos.ownedRoomsId[i]);
    }
    socket.emit('getOthersRoomsJoined', { roomsJoined });
  });
}
