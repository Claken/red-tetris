// Application store wiring: assembles the reducer tree, registers the
// socket middleware, and exposes typed hooks for components to consume.
import { combineReducers, configureStore } from "./reduxLite";
import {
	TypedUseSelectorHook,
	useDispatch,
	useSelector,
} from "./reactReduxLite";
import socketReducer from "./socketSlice";
import { createSocketMiddleware } from "./socketMiddleware";

const rootReducer = combineReducers({
	socket: socketReducer,
});

export const store = configureStore({
	reducer: rootReducer,
	middleware: [createSocketMiddleware()],
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// Typed hook variants so components get inferred state/dispatch types
// without casting at every call site.
export const useAppDispatch: () => AppDispatch = useDispatch as () => AppDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
