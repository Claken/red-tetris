export interface Action<P = unknown> {
	type: string;
	payload?: P;
}

export type Reducer<S = unknown, A extends Action = Action> = (
	state: S | undefined,
	action: A,
) => S;

export interface MiddlewareAPI<S = unknown> {
	getState: () => S;
	dispatch: (action: Action) => unknown;
}

export type Middleware<S = unknown> = (
	api: MiddlewareAPI<S>,
) => (next: (action: Action) => unknown) => (action: Action) => unknown;

export interface ActionCreator<P> {
	(payload: P): Action<P>;
	type: string;
	match: (action: Action) => action is Action<P>;
}

export function createAction<P = void>(type: string): ActionCreator<P> {
	const ac = ((payload: P) => ({ type, payload })) as ActionCreator<P>;
	ac.type = type;
	ac.match = ((action: Action) => action && action.type === type) as ActionCreator<P>["match"];
	return ac;
}

export interface Store<S> {
	getState: () => S;
	dispatch: (action: Action) => unknown;
	subscribe: (listener: () => void) => () => void;
}

export function configureStore<S>(opts: {
	reducer: Reducer<S>;
	middleware?: Array<Middleware<S>>;
}): Store<S> {
	let state: S = opts.reducer(undefined, { type: "@@INIT" });
	const listeners = new Set<() => void>();

	const getState = () => state;
	const subscribe = (fn: () => void) => {
		listeners.add(fn);
		return () => {
			listeners.delete(fn);
		};
	};

	const baseDispatch = (action: Action) => {
		state = opts.reducer(state, action);
		listeners.forEach((l) => l());
		return action;
	};

	let dispatch: (action: Action) => unknown = baseDispatch;
	if (opts.middleware && opts.middleware.length > 0) {
		const api: MiddlewareAPI<S> = {
			getState,
			dispatch: (action) => dispatch(action),
		};
		const chain = opts.middleware.map((m) => m(api));
		dispatch = chain.reduceRight<(action: Action) => unknown>(
			(next, mw) => mw(next),
			baseDispatch,
		);
	}

	return { getState, dispatch, subscribe };
}

export function combineReducers<S extends Record<string, unknown>>(
	reducers: { [K in keyof S]: Reducer<S[K]> },
): Reducer<S> {
	const keys = Object.keys(reducers) as Array<keyof S>;
	return (state: S | undefined, action: Action): S => {
		const next = {} as S;
		let changed = false;
		for (const key of keys) {
			const prev = state ? state[key] : undefined;
			const nextVal = reducers[key](prev, action);
			next[key] = nextVal;
			if (nextVal !== prev) changed = true;
		}
		return changed || !state ? next : state;
	};
}
