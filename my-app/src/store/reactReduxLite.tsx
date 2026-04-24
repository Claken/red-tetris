// Minimal react-redux style bindings for the lightweight store defined in
// `reduxLite.ts`. Provides `<Provider>`, `useStore`, `useDispatch` and
// `useSelector` with the same contract as react-redux, but without the
// external dependency.

import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useReducer,
	useRef,
} from "react";
import type { Store, Action } from "./reduxLite";

// The context carries an `unknown` state type; `useStore<S>` re-casts it
// to the caller-provided shape so consumers don't have to widen types.
const StoreContext = createContext<Store<unknown> | null>(null);

// Wraps the subtree and exposes the given store via context. Generic in
// `S` so the store's state type is preserved at the call site.
export function Provider<S>({
	store,
	children,
}: {
	store: Store<S>;
	children: React.ReactNode;
}) {
	return (
		<StoreContext.Provider value={store as Store<unknown>}>
			{children}
		</StoreContext.Provider>
	);
}

// Returns the store from context. Throws when used outside a `<Provider>`
// so misconfigurations fail loudly instead of silently returning null.
export function useStore<S = unknown>(): Store<S> {
	const store = useContext(StoreContext);
	if (!store) {
		throw new Error("useStore must be used within <Provider>");
	}
	return store as Store<S>;
}

// Stable dispatch reference tied to the store identity. Memoized so it
// can be safely used as a dependency in `useEffect`/`useCallback`.
export function useDispatch(): (action: Action) => unknown {
	const store = useStore();
	return useCallback(
		(action: Action) => store.dispatch(action),
		[store],
	);
}

// Subscribes to the store and re-renders only when the selected slice
// changes. The implementation mirrors react-redux v7's approach:
//   - A `useReducer` counter is used purely as a `forceUpdate` primitive.
//   - The selected value is kept in a ref so `check` can compare against
//     the most recent result without adding it to the effect deps.
//   - `Object.is` is used for equality to match React's default behavior.
//   - `check()` is invoked once after subscribing to catch any state
//     changes that happened between render and effect commit.
export function useSelector<S, R>(selector: (state: S) => R): R {
	const store = useStore<S>();
	const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
	const selectedRef = useRef<R>(selector(store.getState()));
	// Recompute on every render so the returned value reflects the
	// current state even before the subscription effect runs.
	selectedRef.current = selector(store.getState());

	useEffect(() => {
		const check = () => {
			const next = selector(store.getState());
			if (!Object.is(next, selectedRef.current)) {
				selectedRef.current = next;
				forceUpdate();
			}
		};
		const unsubscribe = store.subscribe(check);
		// Guard against updates that fired between render and commit.
		check();
		return unsubscribe;
	}, [store]);

	return selectedRef.current;
}

// Helper type to declare a `useSelector` hook bound to a specific root
// state shape, e.g. `const useAppSelector: TypedUseSelectorHook<RootState>`.
export type TypedUseSelectorHook<S> = <R>(selector: (state: S) => R) => R;
