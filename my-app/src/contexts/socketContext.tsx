import { ReactNode } from "react";
import React from "react";
import { useAppDispatch, useAppSelector } from "../store";
import {
	connectSocket as connectSocketAction,
	socketEmit,
} from "../store/socketActions";
import { useSocketEvent } from "../store/useSocketEvent";

export interface SocketFacade {
	emit: (event: string, payload?: unknown) => void;
	connect: (name: string, uuid: string | undefined) => void;
	connected: boolean;
}

export const SocketProvider = ({ children }: { children: ReactNode }) => {
	return <>{children}</>;
};

export const useSocket = (): SocketFacade => {
	const dispatch = useAppDispatch();
	const connected = useAppSelector((state) => state.socket.connected);

	const emit = (event: string, payload?: unknown) => {
		dispatch(socketEmit({ event, payload }));
	};

	const connect = (name: string, uuid: string | undefined) => {
		dispatch(connectSocketAction({ name, uuid }));
	};

	return { emit, connect, connected };
};

export { useSocketEvent };
