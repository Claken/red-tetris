import type { Action, Reducer } from "./reduxLite";
import { createAction } from "./reduxLite";

// Stores the latest payload for a server event along with a monotonic
// `token`. The token is incremented on every new event so consumers can
// detect "same payload received again" (which reference equality alone
// cannot distinguish).
export interface SocketEventRecord {
	payload: unknown;
	token: number;
}

export interface SocketState {
	connected: boolean;
	// Last-seen event per event name. Used by `useSocketEvent` to fire
	// handlers only when a fresh event arrives.
	events: Record<string, SocketEventRecord>;
}

const initialState: SocketState = {
	connected: false,
	events: {},
};

// Dispatched by the middleware when the underlying socket connects or
// disconnects.
export const socketConnected = createAction<boolean>("socket/connected");

// Dispatched by the middleware for every server event it listens to.
export const socketEventReceived = createAction<{
	name: string;
	payload: unknown;
}>("socket/eventReceived");

const socketReducer: Reducer<SocketState> = (
	state: SocketState | undefined,
	action: Action,
): SocketState => {
	const current = state ?? initialState;

	if (socketConnected.match(action)) {
		return { ...current, connected: action.payload as boolean };
	}

	if (socketEventReceived.match(action)) {
		const { name, payload } = action.payload as {
			name: string;
			payload: unknown;
		};
		const prev = current.events[name];
		// Increment `token` even when the payload is identical so that
		// subscribers can react to repeated events.
		return {
			...current,
			events: {
				...current.events,
				[name]: {
					payload,
					token: (prev?.token ?? 0) + 1,
				},
			},
		};
	}

	return current;
};

export default socketReducer;
