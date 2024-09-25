import { createContext, useState, ReactNode, useContext } from 'react';
import { ISocketContext } from '../interfaces/socketContext.interface';
import { Socket } from "socket.io-client";

const SocketContext = createContext<ISocketContext | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {

	const [socket, setSocket] = useState<Socket | undefined>(undefined);

	return <SocketContext.Provider value={{ socket, setSocket }}>
		{children}
	</SocketContext.Provider>
};

export const useSocket = () => {
	return useContext(SocketContext);
}