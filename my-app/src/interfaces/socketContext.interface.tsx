import React from 'react'
import { Socket } from "socket.io-client";

export interface ISocketContext {
	socket: Socket | undefined;
	setSocket: React.Dispatch<React.SetStateAction<Socket | undefined>>;

}