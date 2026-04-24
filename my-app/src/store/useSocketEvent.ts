import { useEffect, useRef } from "react";
import { useAppSelector } from "./index";

// Subscribes to a server event stored in `state.socket.events`. The handler
// fires only for events received after the hook mounts, and only once per
// new event (tracked via the record's monotonic `token`). Previously
// received events are therefore ignored on mount, which avoids replaying
// stale payloads when a component remounts.
export function useSocketEvent<T = unknown>(
	name: string,
	handler: (payload: T) => void,
): void {
	const record = useAppSelector((state) => state.socket.events[name]);
	// Keep the latest handler in a ref so the effect does not need to
	// re-subscribe when the caller passes a new closure each render.
	const handlerRef = useRef(handler);
	handlerRef.current = handler;
	// `baselineRef` captures the token observed at mount; anything equal
	// to the baseline is considered "already seen".
	const baselineRef = useRef<number | null>(null);

	useEffect(() => {
		if (baselineRef.current === null) {
			baselineRef.current = record?.token ?? 0;
			return;
		}
		if (record && record.token !== baselineRef.current) {
			baselineRef.current = record.token;
			handlerRef.current(record.payload as T);
		}
	}, [record]);
}
