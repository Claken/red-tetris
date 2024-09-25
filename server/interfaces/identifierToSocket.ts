import { Socket } from 'socket.io';
export interface IdentifierToSocket {
  name: string;
  sockets: Socket[];
}
