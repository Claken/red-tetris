import { IdentifierToSocket } from '../../interfaces/identifierToSocket';
import { v4 as uuidv4 } from 'uuid';
import { Socket } from 'socket.io';

export class ManageSocket {
  private static _instance: ManageSocket;
  private userSockets: Map<string, IdentifierToSocket> = new Map();
  private constructor() {}

  private addNewUser(name: string, socket: Socket): void {
    const uuid = uuidv4();
    const idTosocket: IdentifierToSocket = { name: name, sockets: [socket] };
    try {
      this.userSockets.set(uuid, idTosocket);
    } catch (e: any) {
      console.log(e);
    }
    socket.emit('new-person', { uuid: uuid, name: name });
  }

  public static getInstance(): ManageSocket {
    if (!ManageSocket._instance) {
      ManageSocket._instance = new ManageSocket();
    }
    return ManageSocket._instance;
  }

  public getInfos(uuid: string): IdentifierToSocket | undefined {
    return this.userSockets.get(uuid);
  }

  public add(socket: Socket, name: string, uuid: string | undefined): void {
    if (uuid == undefined || !this.userSockets.has(uuid)) {
      this.addNewUser(name, socket);
    } else {
      this.userSockets.get(uuid)?.sockets.push(socket);
    }
  }
  public IdentifierToSocket(uuid: string): IdentifierToSocket | undefined {
    return this.userSockets.get(uuid);
  }
  public deleteSocket(socket: Socket): void {
    this.userSockets.forEach((value) => {
      if (value.sockets.find((elem) => elem.id === socket.id)) {
        value.sockets = value.sockets.filter((elem) => elem.id !== socket.id);
      }
    });
  }
}
