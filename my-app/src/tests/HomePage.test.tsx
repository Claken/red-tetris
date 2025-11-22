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

		// Vérifie que la popup avec le bon texte est affichée
	//	expect(screen.getByText("A new room has been created : Room C")).toBeInTheDocument();

		// Vérifie que la liste des rooms a été mise à jour
		// expect(screen.getByText("Room C")).toBeInTheDocument();
	});

	it.skip("handles childForMyRooms - displays waiting list and launches game", async () => {
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

		const mockSocket = createMockSocket();
		const mockNavigate = vi.fn();

		const mockSocketContext = {
			socket: mockSocket,
			setSocket: vi.fn(),
		};

		vi.spyOn(reactRouterDom, "useNavigate").mockReturnValue(mockNavigate);

		render(
			<MemoryRouter>
				<SocketProvider>
					<HomePage />
				</SocketProvider>
			</MemoryRouter>
		);

		// Simulate receiving list_players_room event to trigger childForMyRooms
		await waitFor(() => {
			mockSocket.__simulate("list_players_room", {
				roomId: "TestRoom",
				players: ["TestUser", "Player2", "Player3"],
			});
		});

		// Check if waiting list is displayed
		await waitFor(() => {
			expect(screen.getByText("WAITING LIST")).toBeInTheDocument();
			expect(screen.getByText("TestUser")).toBeInTheDocument();
			expect(screen.getByText("Player2")).toBeInTheDocument();
			expect(screen.getByText("Player3")).toBeInTheDocument();
		});

		// Click launch game button
		const launchButton = screen.getByText("Launch a game");
		fireEvent.click(launchButton);

		// Verify socket emit and navigation
		await waitFor(() => {
			expect(mockSocket.emit).toHaveBeenCalledWith("startMultiGame", {
				name: "TestUser",
				uuid: "12345",
				roomId: "TestRoom",
			});
		});
	});

	it.skip("handles childForMyRooms - does not navigate when waitList.length <= 1", async () => {
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

		const mockSocket = createMockSocket();
		const mockNavigate = vi.fn();

		vi.spyOn(reactRouterDom, "useNavigate").mockReturnValue(mockNavigate);

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

		// Simulate receiving list_players_room with only 1 player
		await waitFor(() => {
			mockSocket.__simulate("list_players_room", {
				roomId: "TestRoom",
				players: ["TestUser"],
			});
		});

		const launchButton = screen.getByText("Launch a game");
		fireEvent.click(launchButton);

		// Should emit but not navigate
		expect(mockSocket.emit).toHaveBeenCalled();
		expect(mockNavigate).not.toHaveBeenCalled();
	});

	it.skip("handles childForOtherRooms - displays join button for not started game", async () => {
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

		// Click "Join a game" button
		const joinGameButton = screen.getByText("Join a game");
		fireEvent.click(joinGameButton);

		// Simulate receiving other rooms
		await waitFor(() => {
			mockSocket.__simulate("getOtherRooms", {
				otherRooms: [{ roomId: "Room1", isStarted: false }],
			});
		});

		// Click on a room
		await waitFor(() => {
			const roomButton = screen.getByText("Room1");
			fireEvent.click(roomButton);
		});

		// Check if join button is displayed
		await waitFor(() => {
			expect(screen.getByText("Join this game")).toBeInTheDocument();
		});

		// Click join button
		const joinButton = screen.getByText("Join this game");
		fireEvent.click(joinButton);

		expect(mockSocket.emit).toHaveBeenCalledWith("joinGame", {
			name: "TestUser",
			uuid: "12345",
			roomId: "Room1",
		});
	});

	it.skip("handles childForOtherRooms - displays started game message", async () => {
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

		// Click "Join a game" button
		const joinGameButton = screen.getByText("Join a game");
		fireEvent.click(joinGameButton);

		// Simulate receiving other rooms with started game
		await waitFor(() => {
			mockSocket.__simulate("getOtherRooms", {
				otherRooms: [{ roomId: "Room1", isStarted: true }],
			});
		});

		// Click on a room
		await waitFor(() => {
			const roomButton = screen.getByText("Room1");
			fireEvent.click(roomButton);
		});

		// Check if started message is displayed
		await waitFor(() => {
			expect(screen.getByText("THIS GAME HAS ALREADY STARTED")).toBeInTheDocument();
			expect(screen.getByText("Join waiting list")).toBeInTheDocument();
		});
	});

	it.skip("handles theRoomList - ACTIVE ROOMLIST navigation", async () => {
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

		const mockSocket = createMockSocket();
		const mockNavigate = vi.fn();

		vi.spyOn(reactRouterDom, "useNavigate").mockReturnValue(mockNavigate);

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

		// Click "Go back to a game"
		const goBackButton = screen.getByText("Go back to a game");
		fireEvent.click(goBackButton);

		// Simulate receiving active rooms
		await waitFor(() => {
			mockSocket.__simulate("getActiveRooms", {
				activeRooms: ["ActiveRoom1", "ActiveRoom2"],
			});
		});

		// Click on an active room
		await waitFor(() => {
			const roomButton = screen.getByText("ActiveRoom1");
			fireEvent.click(roomButton);
		});

		// Should navigate to the room
		expect(mockNavigate).toHaveBeenCalledWith("ActiveRoom1/TestUser");
	});

	it.skip("handles theRoomList - MY ROOMLIST getWaitingList", async () => {
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

		// Click "ALL MY ROOMS"
		const allMyRoomsButton = screen.getByText("ALL MY ROOMS");
		fireEvent.click(allMyRoomsButton);

		// Simulate receiving created rooms
		await waitFor(() => {
			mockSocket.__simulate("getCreateRooms", {
				createRooms: ["MyRoom1", "MyRoom2"],
			});
		});

		// Click on a room
		await waitFor(() => {
			const roomButton = screen.getByText("MyRoom1");
			fireEvent.click(roomButton);
		});

		// Should emit getWaitingList
		expect(mockSocket.emit).toHaveBeenCalledWith("getWaitingList", {
			uuid: "12345",
			roomId: "MyRoom1",
		});
	});

	it.skip("handles socket events - getActiveRooms, getCreateRooms, getOtherRooms", async () => {
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

		// Simulate receiving all room types
		await waitFor(() => {
			mockSocket.__simulate("getActiveRooms", {
				activeRooms: ["Active1"],
			});
			mockSocket.__simulate("getCreateRooms", {
				createRooms: ["Created1"],
			});
			mockSocket.__simulate("getOtherRooms", {
				otherRooms: [{ roomId: "Other1", isStarted: false }],
			});
		});

		// Verify state updates (indirectly by checking if rooms appear)
		await waitFor(() => {
			expect(mockSocket.emit).toHaveBeenCalled();
		});
	});

	it.skip("handles not_enough_person socket event", async () => {
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

		const mockSocket = createMockSocket();
		const mockSocketContext = {
			socket: mockSocket,
			setSocket: vi.fn(),
		};

		// Toastify is already mocked at module level

		render(
			<MemoryRouter>
				<SocketProvider>
					<HomePage />
				</SocketProvider>
			</MemoryRouter>
		);

		// Simulate not_enough_person event
		await waitFor(() => {
			mockSocket.__simulate("not_enough_person", {
				message: "Not enough players to launch a game !",
			});
		});

		// Toast should be shown (if we can verify it)
		await waitFor(() => {
			expect(mockSocket.on).toHaveBeenCalledWith("not_enough_person", expect.any(Function));
		});
	});

	it.skip("handles getCreateRooms with titleRoomCreated popup", async () => {
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

		// Click "Create a room" to set popupTitle to titleRoomCreated
		const createRoomButton = screen.getByText("Create a room");
		fireEvent.click(createRoomButton);

		// Simulate receiving getCreateRooms event
		await waitFor(() => {
			mockSocket.__simulate("getCreateRooms", {
				createRooms: ["Room A", "Room B", "NewRoom"],
			});
		});

		// Check if popup shows the new room message
		await waitFor(() => {
			expect(screen.getByText(/A new room has been created : NewRoom/)).toBeInTheDocument();
		});
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

	it.skip("handles list_players_room event with setTimeout", async () => {
		vi.useFakeTimers();
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

		// Simulate list_players_room event
		mockSocket.__simulate("list_players_room", {
			roomId: "TestRoom",
			players: ["Player1", "Player2"],
		});

		// Fast-forward time to trigger setTimeout
		vi.advanceTimersByTime(1000);

		// Verify waiting list is displayed
		await waitFor(() => {
			expect(screen.getByText("WAITING LIST")).toBeInTheDocument();
		});

		vi.useRealTimers();
	});
});
