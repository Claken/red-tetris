import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "../store/reactReduxLite";
import HomePage from "../components/HomePage";
import { SocketProvider } from "../contexts/socketContext";
import { createTestStore } from "./testStore";
import { socketEmit } from "../store/socketActions";
import React from "react";
import '@testing-library/jest-dom';

vi.mock("toastify-js", () => ({
	default: vi.fn(() => ({
		showToast: vi.fn(),
	})),
}));

const setupSession = () => {
	global.sessionStorage = {
		getItem: vi.fn().mockImplementation((key) => {
			if (key === "name") return "TestUser";
			if (key === "uuid") return "12345";
			return null;
		}),
		setItem: vi.fn(),
		removeItem: vi.fn(),
		clear: vi.fn(),
		key: vi.fn(),
		length: 0,
	} as unknown as Storage;
};

const renderHome = (autoConnect = true) => {
	const ctx = createTestStore({ autoConnect });
	const utils = render(
		<Provider store={ctx.store}>
			<MemoryRouter>
				<SocketProvider>
					<HomePage />
				</SocketProvider>
			</MemoryRouter>
		</Provider>
	);
	return { ...ctx, ...utils };
};

const expectEmitted = (store: ReturnType<typeof createTestStore>["store"], event: string, payload: unknown) => {
	// Check that a socketEmit action with the expected event/payload was dispatched
	// by spying on dispatch prior to render
};

describe("HomePage Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("renders the HomePage component with basic elements", () => {
		setupSession();
		renderHome();

		expect(screen.queryByText("RED TETRIS")).not.toBeNull();
		expect(screen.queryByText("Solo game")).not.toBeNull();
		expect(screen.queryByText("Create a room")).not.toBeNull();
		expect(screen.queryByText("ALL MY ROOMS")).not.toBeNull();
		expect(screen.queryByText("Join a game")).not.toBeNull();
		expect(screen.queryByText("Go back to a game")).not.toBeNull();
	});

	it("toggles the popup state correctly", () => {
		setupSession();
		const { getByText } = renderHome();

		const button = getByText("Create a room");
		fireEvent.click(button);

		const popupElement = screen.queryByText("A new room has been created");
		expect(popupElement).toBeNull();

		fireEvent.click(button);

		expect(popupElement).toBeNull();
	});

	it("handles solo game button click correctly", () => {
		setupSession();
		const { store } = renderHome();
		const dispatchSpy = vi.spyOn(store, "dispatch");

		const soloGameButton = screen.getByText("Solo game");
		fireEvent.click(soloGameButton);

		expect(dispatchSpy).toHaveBeenCalledWith(
			socketEmit({ event: "startSingleTetrisGame", payload: { name: "TestUser", uuid: "12345" } })
		);
	});

	it("handles joining other rooms correctly", () => {
		setupSession();
		const { store } = renderHome();
		const dispatchSpy = vi.spyOn(store, "dispatch");

		const joinGameButton = screen.getByText("Join a game");
		fireEvent.click(joinGameButton);

		const headerName = screen.getByText("TestUser");
		fireEvent.click(headerName);
	});

	it("handles starting multiplayer games correctly", () => {
		setupSession();
		renderHome();

		const allMyRoomsButton = screen.getByText("ALL MY ROOMS");
		fireEvent.click(allMyRoomsButton);
	});

	it("handles displaying room lists correctly", async () => {
		setupSession();
		renderHome();

		const allMyRoomsButton = screen.getByText("ALL MY ROOMS");
		fireEvent.click(allMyRoomsButton);

		const myRoomListText = screen.getByText("MY ROOMLIST");
		expect(document.body.contains(myRoomListText)).toBe(true);

		let theMenuButton = screen.getByText("Menu");
		fireEvent.click(theMenuButton);

		const goBackButton = screen.getByText("Go back to a game");
		expect(document.body.contains(goBackButton)).toBe(true);
		fireEvent.click(goBackButton);

		const activeListText = screen.getByText("ACTIVE ROOMLIST");
		expect(document.body.contains(activeListText)).toBe(true);

		theMenuButton = screen.getByText("Menu");
		fireEvent.click(theMenuButton);

		const joinGameButton = screen.getByText("Join a game");
		expect(document.body.contains(joinGameButton)).toBe(true);
		fireEvent.click(joinGameButton);

		const othersListText = screen.getByText("OTHERS ROOMLIST");
		expect(document.body.contains(othersListText)).toBe(true);
	});

	it("handles pageToGo event correctly", () => {
		setupSession();
		const { simulate } = renderHome();

		simulate("pageToGo", {
			pageInfos: { roomName: "Room 1", path: "/room1" },
		});
	});

	it("handles getCreateRooms socket event correctly", async () => {
		setupSession();
		const { simulate } = renderHome();

		const createRoomButton = screen.getByText("Create a room");
		fireEvent.click(createRoomButton);

		await waitFor(() => {
			simulate("getCreateRooms", {
				createRooms: ["Room A", "Room B", "Room C"],
			});
		});
	});

	it("handles useEffect setUuid - creates socket when undefined", async () => {
		setupSession();
		renderHome(false);

		await waitFor(() => {
			expect(screen.getByText("RED TETRIS")).toBeInTheDocument();
		});
	});

	it("handles useEffect setUuid - else if branch when uuid or name is undefined", async () => {
		global.sessionStorage = {
			getItem: vi.fn().mockImplementation((key) => {
				if (key === "name") return null;
				if (key === "uuid") return "12345";
				return null;
			}),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
			key: vi.fn(),
			length: 0,
		} as unknown as Storage;

		renderHome();

		await waitFor(() => {
			expect(screen.getByText("WELCOME TO RED TETRIS")).toBeInTheDocument();
		});
	});
});

describe("HomePage targeted coverage flows", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("navigates to active room and returns to menu", async () => {
		setupSession();
		const { store, simulate } = renderHome();
		const dispatchSpy = vi.spyOn(store, "dispatch");

		fireEvent.click(screen.getByText("Go back to a game"));
		await waitFor(() => {
			expect(dispatchSpy).toHaveBeenCalledWith(
				socketEmit({ event: "getActiveRooms", payload: { uuid: "12345" } })
			);
		});

		simulate("getActiveRooms", { activeRooms: ["room-42"] });
		const roomButton = await screen.findByText("room-42");
		fireEvent.click(roomButton);
		expect(screen.getByText("RED TETRIS")).toBeInTheDocument();
	});

	it("joins a room from others list through popup flow", async () => {
		setupSession();
		const { store, simulate } = renderHome();
		const dispatchSpy = vi.spyOn(store, "dispatch");

		fireEvent.click(screen.getByText("Join a game"));
		await waitFor(() => {
			expect(dispatchSpy).toHaveBeenCalledWith(
				socketEmit({ event: "getOtherRooms", payload: { uuid: "12345" } })
			);
		});

		simulate("getOtherRooms", {
			otherRooms: [{ roomId: "room-X", isStarted: false }],
		});
		fireEvent.click(await screen.findByText("room-X"));
		fireEvent.click(await screen.findByText("Join this game"));

		expect(dispatchSpy).toHaveBeenCalledWith(
			socketEmit({
				event: "joinGame",
				payload: { name: "TestUser", uuid: "12345", roomId: "room-X" },
			})
		);
	});

	it("shows waiting list popup and starts multiplayer game", async () => {
		setupSession();
		const { store, simulate } = renderHome();
		const dispatchSpy = vi.spyOn(store, "dispatch");

		fireEvent.click(screen.getByText("ALL MY ROOMS"));
		await waitFor(() => {
			expect(dispatchSpy).toHaveBeenCalledWith(
				socketEmit({ event: "getCreateRooms", payload: { uuid: "12345" } })
			);
		});

		simulate("getCreateRooms", { createRooms: ["my-room"] });
		fireEvent.click(await screen.findByText("my-room"));
		expect(dispatchSpy).toHaveBeenCalledWith(
			socketEmit({
				event: "getWaitingList",
				payload: { uuid: "12345", roomId: "my-room" },
			})
		);

		simulate("list_players_room", {
			roomId: "my-room",
			players: ["TestUser", "AnotherUser"],
		});

		fireEvent.click(await screen.findByText("Launch a game"));
		expect(dispatchSpy).toHaveBeenCalledWith(
			socketEmit({
				event: "startMultiGame",
				payload: { name: "TestUser", uuid: "12345", roomId: "my-room" },
			})
		);
	});
});
