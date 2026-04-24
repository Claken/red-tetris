// Minimal Redux-like implementation used to avoid pulling in the full
// @reduxjs/toolkit dependency. Mirrors the core API (actions, reducers,
// middleware, store) with just enough surface to support the app.

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

// Standard middleware signature: curried function returning the chained
// dispatch. Middlewares are composed right-to-left in `configureStore`.
export type Middleware<S = unknown> = (
	api: MiddlewareAPI<S>,
) => (next: (action: Action) => unknown) => (action: Action) => unknown;

export interface ActionCreator<P> {
	(payload: P): Action<P>;
	type: string;
	match: (action: Action) => action is Action<P>;
}

// Builds a typed action creator with a `match` type guard, similar to
// Redux Toolkit's `createAction`. The guard is used by reducers and
// middleware to narrow action payload types.
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
	// Seed state with an init action so every reducer returns its default.
	let state: S = opts.reducer(undefined, { type: "@@INIT" });
	const listeners = new Set<() => void>();

	const getState = () => state;
	const subscribe = (fn: () => void) => {
		listeners.add(fn);
		return () => {
			listeners.delete(fn);
		};
	};

	// The base dispatch runs the reducer and notifies subscribers. It is the
	// innermost function of the middleware chain.
	const baseDispatch = (action: Action) => {
		state = opts.reducer(state, action);
		listeners.forEach((l) => l());
		return action;
	};

	let dispatch: (action: Action) => unknown = baseDispatch;
	if (opts.middleware && opts.middleware.length > 0) {
		// The api's `dispatch` intentionally forwards to the outer `dispatch`
		// variable so middlewares can re-dispatch through the full chain.
		const api: MiddlewareAPI<S> = {
			getState,
			dispatch: (action) => dispatch(action),
		};
		const chain = opts.middleware.map((m) => m(api));
		// reduceRight composes middlewares so the first entry runs first.
		dispatch = chain.reduceRight<(action: Action) => unknown>(
			(next, mw) => mw(next),
			baseDispatch,
		);
	}

	return { getState, dispatch, subscribe };
}

// Combines slice reducers into a single root reducer keyed by slice name.
// Returns the previous state reference unchanged when no slice produced a
// new value, which helps downstream reference-equality checks.
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
