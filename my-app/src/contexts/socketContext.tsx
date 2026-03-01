import React, { createContext, useState, ReactNode, useContext, useCallback, useEffect, useMemo, useRef } from 'react';
import { ISocketContext } from '../interfaces/socketContext.interface';
import { Socket, io } from "socket.io-client";

export const SocketContext = createContext<ISocketContext | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {

	const [socket, setSocket] = useState<Socket | undefined>(undefined);
	const socketRef = useRef<Socket | undefined>(undefined);

	// Keep ref in sync for cleanup
	useEffect(() => {
		socketRef.current = socket;
	}, [socket]);

	const connectSocket = useCallback((name: string, uuid?: string) => {
		setSocket((current) => {
			if (current) return current;
			return io(import.meta.env.VITE_SERVER_URL, {
				query: { name, uuid: uuid || undefined },
			});
		});
	}, []);

	const disconnectSocket = useCallback(() => {
		setSocket((current) => {
			if (current) {
				current.removeAllListeners();
				current.disconnect();
			}
			return undefined;
		});
	}, []);

	// Auto-reconnect from sessionStorage on mount
	useEffect(() => {
		const storedName = sessionStorage.getItem("name");
		const storedUuid = sessionStorage.getItem("uuid");
		if (storedName && storedUuid) {
			connectSocket(storedName, storedUuid);
		}
	}, [connectSocket]);

	// Disconnect on provider unmount
	useEffect(() => {
		return () => {
			socketRef.current?.disconnect();
		};
	}, []);

	// Disconnect on tab/window close
	useEffect(() => {
		const handleBeforeUnload = () => {
			socketRef.current?.disconnect();
		};
		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, []);

	const value = useMemo(() => ({ socket, setSocket, connectSocket, disconnectSocket }), [socket, connectSocket, disconnectSocket]);

	return <SocketContext.Provider value={value}>
		{children}
	</SocketContext.Provider>
};

export const useSocket = () => {
	return useContext(SocketContext);
}