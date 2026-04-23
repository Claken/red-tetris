import type { Middleware, Action } from "./reduxLite";
import { io, Socket } from "socket.io-client";
import {
	connectSocket,
	disconnectSocket,
	socketEmit,
} from "./socketActions";
import { socketConnected, socketEventReceived } from "./socketSlice";

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

export type SocketFactory = (opts: {
	name: string;
	uuid: string | undefined;
}) => Socket;

const defaultFactory: SocketFactory = ({ name, uuid }) =>
	io(SOCKET_URL, { query: { name, uuid } });

export const createSocketMiddleware = (
	socketFactory: SocketFactory = defaultFactory,
): Middleware => {
	let socket: Socket | undefined;

	return (api) => (next) => (action: Action) => {
		if (connectSocket.match(action)) {
			if (socket) {
				return next(action);
			}
			const { name, uuid } = action.payload as {
				name: string;
				uuid: string | undefined;
			};
			socket = socketFactory({ name, uuid });

			socket.on("connect", () => {
				api.dispatch(socketConnected(true));
			});
			socket.on("disconnect", () => {
				api.dispatch(socketConnected(false));
			});

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
