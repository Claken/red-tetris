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

export const useAppDispatch: () => AppDispatch = useDispatch as () => AppDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
