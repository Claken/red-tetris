import type { Middleware, Action } from "./reduxLite";
import { io, Socket } from "socket.io-client";
import {
	connectSocket,
	disconnectSocket,
	socketEmit,
} from "./socketActions";
import { socketConnected, socketEventReceived } from "./socketSlice";

// Server-emitted events that should be forwarded into the Redux store.
// Any new event sent by the backend must be registered here so the
// middleware subscribes to it and the UI can react via `useSocketEvent`.
const SERVER_EVENTS = [
	"new-person",
	"pageToGo",
	"getActiveRooms",
	"getCreateRooms",
	"getOtherRooms",
	"list_players_room",
	"not_enough_person",
	"room_joined",
	"room_join_failed",
	"room_players_update",
	"room_host_changed",
	"room_start_failed",
	"countdown",
	"beforeGame",
	"myGame",
	"endGame",
	"noGame",
] as const;

export const SOCKET_URL = "http://localhost:3000";

// A `SocketFactory` is injectable to ease unit testing: tests can pass a
// fake factory returning a mock Socket instead of opening a real network
// connection.
export type SocketFactory = (opts: {
	name: string;
	uuid: string | undefined;
}) => Socket;

const defaultFactory: SocketFactory = ({ name, uuid }) =>
	io(SOCKET_URL, { query: { name, uuid } });

// Bridges Redux and socket.io: translates `connect/emit/disconnect`
// actions into socket operations and incoming server events into
// dispatched Redux actions. The socket instance is kept in the closure
// so it persists across dispatches without leaking into the store.
export const createSocketMiddleware = (
	socketFactory: SocketFactory = defaultFactory,
): Middleware => {
	let socket: Socket | undefined;

	return (api) => (next) => (action: Action) => {
		if (connectSocket.match(action)) {
			// Ignore duplicate connect requests to keep a single socket.
			if (socket) {
				return next(action);
			}
			const { name, uuid } = action.payload as {
				name: string;
				uuid: string | undefined;
			};
			socket = socketFactory({ name, uuid });

			// Mirror the socket's connection status into the store.
			socket.on("connect", () => {
				api.dispatch(socketConnected(true));
			});
			socket.on("disconnect", () => {
				api.dispatch(socketConnected(false));
			});

			// Forward every whitelisted server event into the store.
			for (const event of SERVER_EVENTS) {
				socket.on(event, (payload: unknown) => {
					api.dispatch(
						socketEventReceived({ name: event, payload }),
					);
				});
			}

			return next(action);
		}

		if (socketEmit.match(action)) {
			const { event, payload } = action.payload as {
				event: string;
				payload?: unknown;
			};
			// Silently drop emits issued before connect; callers should
			// gate on `state.socket.connected` when ordering matters.
			socket?.emit(event, payload);
			return next(action);
		}

		if (disconnectSocket.match(action)) {
			if (socket) {
				socket.disconnect();
				socket = undefined;
				api.dispatch(socketConnected(false));
			}
			return next(action);
		}

		return next(action);
	};
};
