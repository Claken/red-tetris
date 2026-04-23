import { useEffect, useRef } from "react";
import { useAppSelector } from "./index";

export function useSocketEvent<T = unknown>(
	name: string,
	handler: (payload: T) => void,
): void {
	const record = useAppSelector((state) => state.socket.events[name]);
	const handlerRef = useRef(handler);
	handlerRef.current = handler;
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
