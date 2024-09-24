import { IdentifierToSocket } from '../../interfaces/identifierToSocket';
import { v4 as uuidv4 } from 'uuid';

export class ManageSocket {
  private static _instance: ManageSocket;
  private userSockets: Map<string, IdentifierToSocket>;
  private constructor() {}

  private addNewUser(name: string, socketId: string): void {
    const uuid = uuidv4();
    this.userSockets.set(uuid, { name: name, sockets: [socketId] });
  }

  public static getInstance(): ManageSocket {
    if (!ManageSocket._instance) {
      ManageSocket._instance = new ManageSocket();
    }
    return ManageSocket._instance;
  }
  public add(socketId: string, name: string, uuid: string | undefined): void {
    if (uuid == undefined || !this.userSockets.has(uuid)) {
      this.addNewUser(name, socketId);
    } else {
      this.userSockets.get(uuid)?.sockets.push(socketId);
    }
  }
  public IdentifierToSocket(uuid: string): IdentifierToSocket | undefined {
    return this.userSockets.get(uuid);
  }
  public deleteSocket(socketId: string): void {
    this.userSockets.forEach((value) => {
      if (value.sockets.find((socket) => socket === socketId)) {
        value.sockets = value.sockets.filter((socket) => socket !== socketId);
      }
    });
  }
}
