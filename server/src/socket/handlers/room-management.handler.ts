import { Socket } from 'socket.io';
import type { HandlerContext } from '../handler-context';

export function registerRoomManagementHandlers(socket: Socket, ctx: HandlerContext): void {
  const { waitGame, manageSocket, isValidData } = ctx;

  socket.on('createRoom', (data) => {
    if (!isValidData(data, 'uuid')) return;
    const infos = manageSocket.getInfos(data.uuid);
    if (infos == undefined) return;
    waitGame.createGame(data.uuid, infos.name, socket.id);
  });

  socket.on('joinGame', (data) => {
    if (!isValidData(data, 'uuid', 'roomId')) return;
    const infos = manageSocket.getInfos(data.uuid);
    if (infos == undefined) return;
    waitGame.joinGame(data.uuid, infos.name, socket.id, data.roomId);
  });

  socket.on('joinRoom', (data) => {
    if (!isValidData(data, 'uuid', 'roomId')) return;
    const infos = manageSocket.getInfos(data.uuid);
    if (infos == undefined) return;
    const result = waitGame.joinRoom(data.uuid, infos.name, socket.id, data.roomId);
    if (result.success) {
      socket.emit('room_joined', { success: true, roomId: data.roomId });
    } else {
      socket.emit('room_join_failed', { reason: result.reason, roomId: data.roomId });
    }
  });

  socket.on('leaveRoom', (data) => {
    if (!isValidData(data, 'uuid', 'roomId')) return;
    const infos = manageSocket.getInfos(data.uuid);
    if (infos == undefined) return;
    waitGame.leaveRoom(data.uuid, socket.id, data.roomId);
    socket.emit('room_left', { success: true, roomId: data.roomId });
  });

  socket.on('startRoom', async (data) => {
    if (!isValidData(data, 'uuid', 'roomId')) return;
    const infos = manageSocket.getInfos(data.uuid);
    if (infos == undefined) return;
    const result = await waitGame.startRoom(data.uuid, infos.name, socket.id, data.roomId);
    if (!result.success) {
      socket.emit('room_start_failed', { reason: result.reason, roomId: data.roomId });
    }
  });

  socket.on('playerDecision', (data) => {
    if (!isValidData(data, 'uuid', 'roomId', 'decision')) return;
    const infos = manageSocket.getInfos(data.uuid);
    if (infos == undefined) return;
    waitGame.playerDecision(data.uuid, socket.id, data.roomId, data.decision);
  });
}
