import { createAction } from "./reduxLite";

export interface ConnectSocketPayload {
	name: string;
	uuid: string | undefined;
}

export interface SocketEmitPayload {
	event: string;
	payload?: unknown;
}

export const connectSocket = createAction<ConnectSocketPayload>(
	"socket/connect",
);

export const disconnectSocket = createAction<void>("socket/disconnect");

export const socketEmit = createAction<SocketEmitPayload>("socket/emit");
