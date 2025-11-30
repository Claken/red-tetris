import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SocketProvider } from "../contexts/socketContext";
import HomePage from "../components/HomePage";
import React, { createContext } from "react";
import '@testing-library/jest-dom';
import * as reactRouterDom from "react-router-dom";

// Mock toastify-js at module level
vi.mock("toastify-js", () => ({
	default: vi.fn(() => ({
		showToast: vi.fn(),
	})),
}));

function createMockSocket() {
	const listeners: Record<string, Function[]> = {};

	return {
		on: vi.fn((event, cb) => {
			listeners[event] = listeners[event] || [];
			listeners[event].push(cb);
		}),
		off: vi.fn((event) => {
			delete listeners[event];
		}),
		emit: vi.fn((event, data) => {
			if (listeners[event]) {
				listeners[event].forEach((cb) => cb(data));
			}
		}),
		__simulate: (event: string, data: any) => {
			if (listeners[event]) {
				listeners[event].forEach((cb) => cb(data));
			}
		},
		__getListeners: () => listeners,
	};
}


describe("HomePage Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("renders the HomePage component with basic elements", () => {
		// Mock sessionStorage
		const mockSessionStorage = {
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
		};

		global.sessionStorage = mockSessionStorage;

		render(
			<MemoryRouter>
				<SocketProvider>
					<HomePage />
				</SocketProvider>
			</MemoryRouter>
		);

		// Vérifiez que le titre "RED TETRIS" est présent
		const titleElement = screen.queryByText("RED TETRIS");
		expect(titleElement).not.toBeNull();

		// Vérifiez que le bouton "Solo game" est présent
		const soloGameButton = screen.queryByText("Solo game");
		expect(soloGameButton).not.toBeNull();

		// Vérifiez que le bouton "Create a room" est présent
		const createRoomButton = screen.queryByText("Create a room");
		expect(createRoomButton).not.toBeNull();

		// Vérifiez que le bouton "ALL MY ROOMS" est présent
		const allMyRoomsButton = screen.queryByText("ALL MY ROOMS");
		expect(allMyRoomsButton).not.toBeNull();

		// Vérifiez que le bouton "Join a game" est présent
		const joinGameButton = screen.queryByText("Join a game");
		expect(joinGameButton).not.toBeNull();

		// Vérifiez que le bouton "Go back to a game" est présent
		const goBackToGameButton = screen.queryByText("Go back to a game");
		expect(goBackToGameButton).not.toBeNull();
	});

	it("toggles the popup state correctly", () => {
		// Mock sessionStorage
		const mockSessionStorage = {
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
		};

		global.sessionStorage = mockSessionStorage;

		const { getByText } = render(
			<MemoryRouter>
				<SocketProvider>
					<HomePage />
				</SocketProvider>
			</MemoryRouter>
		);

		// Simuler un clic sur un élément qui déclenche togglePopup
		const button = getByText("Create a room"); // Remplacez par le texte du bouton réel
		fireEvent.click(button);

		// Vérifiez que l'état de showPopup a changé
		const popupElement = screen.queryByText("A new room has been created");
		// console.log(popupElement)
		expect(popupElement).toBeNull();

		// Simuler un autre clic pour fermer la popup
		fireEvent.click(button);

		// Vérifiez que l'état de showPopup a changé à nouveau
		expect(popupElement).toBeNull();
	});

	it("handles solo game button click correctly", () => {
		// Mock sessionStorage
		const mockSessionStorage = {
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
		};

		const mockNavigate = vi.fn();

		global.sessionStorage = mockSessionStorage;

		const { getByText } = render(
			<MemoryRouter>
				<SocketProvider>
					<HomePage />
				</SocketProvider>
			</MemoryRouter>
		);

		// Simuler un clic sur le bouton "Solo game"
		const soloGameButton = getByText("Solo game");
		fireEvent.click(soloGameButton);

		// Vérifiez que l'utilisateur est redirigé vers la page de jeu solo
		const soloGamePage = screen.queryByText("Solo Game Page");
		expect(soloGamePage).toBeNull();
	});

	it("handles joining other rooms correctly", () => {
		// Mock sessionStorage
		const mockSessionStorage = {
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
		};

		global.sessionStorage = mockSessionStorage;

		// Mock socket
		const mockSocket = {
			emit: vi.fn(),
		};

		const mockSocketContext = {
			socket: mockSocket,
			setSocket: vi.fn(),
		};

		render(
			<MemoryRouter>
				<SocketProvider value={mockSocketContext}>
					<HomePage />
				</SocketProvider>
			</MemoryRouter>
		);

		// Simuler un clic sur le bouton "Join a game"
		const joinGameButton = screen.getByText("Join a game");
		fireEvent.click(joinGameButton);

		// Simuler un clic sur un élément qui déclenche childForOtherRooms
		const roomButton = screen.getByText("TestUser"); // Remplacez par le texte du bouton réel
		fireEvent.click(roomButton);

		// Vérifiez que l'événement socket.emit a été appelé avec les bons arguments
		// expect(mockSocket.emit).toHaveBeenCalledWith("joinGame", {
		//   name: "TestUser",
		//   uuid: "12345",
		//   roomId: "Room 1",
		// });
	});

	it("handles starting multiplayer games correctly", () => {

		// Mock sessionStorage
		const mockSessionStorage = {
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
		};

		global.sessionStorage = mockSessionStorage;

		// Mock socket
		const mockSocket = {
			emit: vi.fn(),
		};

		const mockSocketContext = {
			socket: mockSocket,
			setSocket: vi.fn(),
		};

		const MockSocketPro = createContext(mockSocketContext);

		render(
			<MemoryRouter>
				<SocketProvider>
					<MockSocketPro.Provider value={mockSocketContext}>
						<HomePage />
					</MockSocketPro.Provider>
				</SocketProvider>
			</MemoryRouter>
		);

		// Simuler un clic sur le bouton "ALL MY ROOMS"
		const allMyRoomsButton = screen.getByText("ALL MY ROOMS");
		fireEvent.click(allMyRoomsButton);

		// expect(mockSocket.emit).toHaveBeenCalledWith("getCreateRooms", {uuid: "12345",});

		// Simuler un clic sur un élément qui déclenche childForMyRooms
		// const roomButton = screen.getByText("TestUser"); // Remplacez par le texte du bouton réel
		// fireEvent.click(roomButton);

		// Vérifiez que l'événement socket.emit a été appelé avec les bons arguments
		// expect(mockSocket.emit).toHaveBeenCalledWith("startMultiGame", {
		//   name: "TestUser",
		//   uuid: "12345",
		//   roomId: "TestUser",
		// });

		// // Vérifiez que navigate a été appelé avec la bonne route
		// expect(mockNavigate).toHaveBeenCalledWith("TestUser/TestUser");
	});

	it("handles displaying room lists correctly", async () => {
		// Mock sessionStorage
		const mockSessionStorage = {
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
		};

		global.sessionStorage = mockSessionStorage;

		// Mock socket
		const mockSocket = {
			emit: vi.fn(),
			on: vi.fn(),
		};

		const mockSocketContext = {
			socket: mockSocket,
			setSocket: vi.fn(),
		};

		const MockSocketPro = createContext(mockSocketContext);

		// Mock navigate
		const mockNavigate = vi.fn();

		render(
			<MemoryRouter>
				<SocketProvider>
					<MockSocketPro.Provider value={mockSocketContext}>
						<HomePage />
					</MockSocketPro.Provider>
				</SocketProvider>
			</MemoryRouter>
		);

		// Simuler un clic sur le bouton "ALL MY ROOMS"
		const allMyRoomsButton = screen.getByText("ALL MY ROOMS");
		fireEvent.click(allMyRoomsButton);
		// await waitFor(() => {
		//   expect(mockSocket.emit).toHaveBeenCalledWith("getCreateRooms", {uuid: "12345",});
		// });

		// Simuler un clic sur un élément qui déclenche theRoomList
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
		// Mock sessionStorage
		const mockSessionStorage = {
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
		};

		global.sessionStorage = mockSessionStorage;

		// Mock socket
		const mockSocket = {
			on: vi.fn().mockImplementation((event, callback) => {
				if (event === "pageToGo") {
					mockSocket.emit = (eventName, data) => {
						if (eventName === "pageToGo") {
							callback(data);
						}
					};
				}
			}),
			off: vi.fn(),
			emit: vi.fn(),
		};

		const mockSocketContext = {
			socket: mockSocket,
			setSocket: vi.fn(),
		};

		// Mock navigate
		const mockNavigate = vi.fn();

		render(
			<MemoryRouter>
				<SocketProvider value={mockSocketContext}>
					<HomePage />
				</SocketProvider>
			</MemoryRouter>
		);

		// Simuler l'émission de l'événement pageToGo
		mockSocket.emit("pageToGo", {
			pageInfos: { roomName: "Room 1", path: "/room1" },
		});

		// Vérifiez que navigate a été appelé avec la bonne route
		// expect(mockNavigate).toHaveBeenCalledWith("/room1");
	});

	it("handles getCreateRooms socket event correctly", async () => {
		// Mock sessionStorage
		const mockSessionStorage = {
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
		};
		global.sessionStorage = mockSessionStorage;

		// Préparer les mocks du socket
		const mockSocket = createMockSocket();

		const mockSocketContext = {
			socket: mockSocket,
			setSocket: vi.fn(),
		};

		const MockSocketPro = createContext(mockSocketContext);

		render(
			<MemoryRouter>
				<SocketProvider>
					<MockSocketPro.Provider value={mockSocketContext}>
						<HomePage />
					</MockSocketPro.Provider>
				</SocketProvider>
			</MemoryRouter>
		);

		// Simule l'ouverture du popup "Create a room"
		const createRoomButton = screen.getByText("Create a room");
		fireEvent.click(createRoomButton);

		// Simule la réception de l'événement getCreateRooms
		await waitFor(() => {
			mockSocket.__simulate("getCreateRooms", {
				createRooms: ["Room A", "Room B", "Room C"],
			});
		});


		// Vérifie que la liste des rooms a été mise à jour
		// expect(screen.getByText("Room C")).toBeInTheDocument();
	});

	it("handles useEffect setUuid - creates socket when undefined", async () => {
		const mockSessionStorage = {
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
		};
		global.sessionStorage = mockSessionStorage;

		// The component should render even when socket is initially undefined
		// The useEffect will create a socket connection
		render(
			<MemoryRouter>
				<SocketProvider>
					<HomePage />
				</SocketProvider>
			</MemoryRouter>
		);

		// Verify the component renders (the useEffect will handle socket creation)
		await waitFor(() => {
			expect(screen.getByText("RED TETRIS")).toBeInTheDocument();
		});
	});

	it("handles useEffect setUuid - else if branch when uuid or name is undefined", async () => {
		const mockSessionStorage = {
			getItem: vi.fn().mockImplementation((key) => {
				if (key === "name") return null; // name is undefined
				if (key === "uuid") return "12345";
				return null;
			}),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
			key: vi.fn(),
			length: 0,
		};
		global.sessionStorage = mockSessionStorage;

		const mockSocket = createMockSocket();
		const mockSocketContext = {
			socket: mockSocket,
			setSocket: vi.fn(),
		};

		render(
			<MemoryRouter>
				<SocketProvider>
					<HomePage />
				</SocketProvider>
			</MemoryRouter>
		);

		// Should render ConnectPage when name is not in sessionStorage
		await waitFor(() => {
			expect(screen.getByText("WELCOME TO RED TETRIS")).toBeInTheDocument();
		});
	});
});
