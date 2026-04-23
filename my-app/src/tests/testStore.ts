import { vi } from "vitest";
import { act } from "@testing-library/react";
import { combineReducers, configureStore } from "../store/reduxLite";
import socketReducer, {
	socketConnected,
	socketEventReceived,
} from "../store/socketSlice";
import {
	createSocketMiddleware,
	SocketFactory,
} from "../store/socketMiddleware";

export interface FakeSocket {
	on: ReturnType<typeof vi.fn>;
	off: ReturnType<typeof vi.fn>;
	emit: ReturnType<typeof vi.fn>;
	disconnect: ReturnType<typeof vi.fn>;
	__listeners: Record<string, Array<(p: unknown) => void>>;
	__simulate: (event: string, payload: unknown) => void;
}

export function createFakeSocket(): FakeSocket {
	const listeners: Record<string, Array<(p: unknown) => void>> = {};
	const socket: FakeSocket = {
		on: vi.fn((event: string, cb: (p: unknown) => void) => {
			listeners[event] = listeners[event] || [];
			listeners[event].push(cb);
		}),
		off: vi.fn((event: string) => {
			delete listeners[event];
		}),
		emit: vi.fn(),
		disconnect: vi.fn(),
		__listeners: listeners,
		__simulate: (event: string, payload: unknown) => {
			(listeners[event] || []).forEach((cb) => cb(payload));
		},
	};
	return socket;
}

export function createTestStore(opts?: {
	autoConnect?: boolean;
	socket?: FakeSocket;
}) {
	const fakeSocket = opts?.socket ?? createFakeSocket();
	const factory: SocketFactory = () => fakeSocket as unknown as never;
	const middleware = createSocketMiddleware(factory);

	const rootReducer = combineReducers({ socket: socketReducer });

	const store = configureStore({
		reducer: rootReducer,
		middleware: [middleware],
	});

	if (opts?.autoConnect) {
		store.dispatch(socketConnected(true));
	}

	const simulate = (event: string, payload: unknown) => {
		act(() => {
			store.dispatch(socketEventReceived({ name: event, payload }));
		});
	};

	return { store, fakeSocket, simulate };
}
