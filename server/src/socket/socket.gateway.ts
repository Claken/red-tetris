import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { WaitGame } from '../../class/waitGame/waitGame';
import { SocketService } from './socket.service';
import { ManageSocket } from '../../class/manageSocket/manageSocket';
import type { HandlerContext } from './handler-context';
import { registerGameActionsHandlers } from './handlers/game-actions.handler';
import { registerGameLifecycleHandlers } from './handlers/game-lifecycle.handler';
import { registerRoomQueriesHandlers } from './handlers/room-queries.handler';
import { registerRoomManagementHandlers } from './handlers/room-management.handler';

@WebSocketGateway({ cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173' } })
export class SocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server: Server;
  private waitGame: WaitGame;
  private manageSocket: ManageSocket = ManageSocket.getInstance();

  constructor(private readonly socketService: SocketService) {}
  afterInit(): void {
    this.waitGame = WaitGame.getInstance(this.server);
  }

  private isValidData(data: any, ...fields: string[]): boolean {
    if (data == undefined) return false;
    for (const field of fields) {
      if (data[field] == undefined || typeof data[field] !== 'string' || data[field].trim() === '') {
        return false;
      }
    }
    return true;
  }

  private getHandlerContext(): HandlerContext {
    return {
      waitGame: this.waitGame,
      manageSocket: this.manageSocket,
      isValidData: this.isValidData.bind(this),
    };
  }

  private listenToEmmitter(socket: Socket) {
    const ctx = this.getHandlerContext();
    registerGameActionsHandlers(socket, ctx);
    registerGameLifecycleHandlers(socket, ctx);
    registerRoomQueriesHandlers(socket, ctx);
    registerRoomManagementHandlers(socket, ctx);
  }

  handleConnection(socket: Socket): void {
    this.socketService.handleConnection(socket);
    const name = socket.handshake.query.name as string | undefined;
    let uuid = socket.handshake.query.uuid as string | undefined;
    if (uuid === 'undefined' || uuid === '') uuid = undefined;
    if (name == undefined || typeof name != 'string') {
      return;
    }
    this.manageSocket.add(socket, name, uuid);
    if (uuid !== undefined) {
      this.waitGame.addSocket(uuid, socket.id);
    }
    this.listenToEmmitter(socket);
  }

  handleDisconnect(socket: Socket): void {
    let uuid = socket.handshake.query.uuid as string | undefined;
    if (uuid === 'undefined' || uuid === '') uuid = undefined;

    if (!uuid || !this.waitGame.getUUIDMapings().has(uuid)) {
      for (const [key, value] of this.waitGame.getUUIDMapings()) {
        if (value.socketsId.includes(socket.id)) {
          uuid = key;
          break;
        }
      }
    }

    if (uuid) {
      const infos = this.waitGame.getUUIDMapings().get(uuid);
      if (infos) {
        const lobbyRooms = [...infos.lobbyRoomsId];
        for (const roomId of lobbyRooms) {
          this.waitGame.leaveRoom(uuid, socket.id, roomId);
        }
      }
    }
    this.waitGame.deleteSocket(socket.id);
    this.manageSocket.deleteSocket(socket);
  }
}
