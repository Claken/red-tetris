// Action creators consumed by the socket middleware. These actions are the
// only public API to trigger socket side-effects from components/hooks.
import { createAction } from "./reduxLite";

export interface ConnectSocketPayload {
	name: string;
	uuid: string | undefined;
}

export interface SocketEmitPayload {
	event: string;
	payload?: unknown;
}

// Opens the socket.io connection (no-op if one is already open).
export const connectSocket = createAction<ConnectSocketPayload>(
	"socket/connect",
);

// Tears down the current socket connection, if any.
export const disconnectSocket = createAction<void>("socket/disconnect");

// Emits an arbitrary event to the server through the active socket.
export const socketEmit = createAction<SocketEmitPayload>("socket/emit");
