import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useReducer,
	useRef,
} from "react";
import type { Store, Action } from "./reduxLite";

const StoreContext = createContext<Store<unknown> | null>(null);

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

export function useStore<S = unknown>(): Store<S> {
	const store = useContext(StoreContext);
	if (!store) {
		throw new Error("useStore must be used within <Provider>");
	}
	return store as Store<S>;
}

export function useDispatch(): (action: Action) => unknown {
	const store = useStore();
	return useCallback(
		(action: Action) => store.dispatch(action),
		[store],
	);
}

export function useSelector<S, R>(selector: (state: S) => R): R {
	const store = useStore<S>();
	const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
	const selectedRef = useRef<R>(selector(store.getState()));
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
		check();
		return unsubscribe;
	}, [store]);

	return selectedRef.current;
}

export type TypedUseSelectorHook<S> = <R>(selector: (state: S) => R) => R;
