import type { Action, Reducer } from "./reduxLite";
import { createAction } from "./reduxLite";

export interface SocketEventRecord {
	payload: unknown;
	token: number;
}

export interface SocketState {
	connected: boolean;
	events: Record<string, SocketEventRecord>;
}

const initialState: SocketState = {
	connected: false,
	events: {},
};

export const socketConnected = createAction<boolean>("socket/connected");
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
