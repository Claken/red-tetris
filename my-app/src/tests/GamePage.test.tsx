import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { cellColorMainGrid, getTetroColor, displayTetromino, displaySpectrums } from '../functions/forTheGame';
import GamePage from '../components/GamePage';
import { MemoryRouter } from 'react-router-dom';
import { SocketProvider, SocketContext } from '../contexts/socketContext';
import React from 'react';
import '@testing-library/jest-dom';
import * as reactRouterDom from 'react-router-dom';

// Mock toastify-js at module level
vi.mock("toastify-js", () => ({
	default: vi.fn(() => ({
		showToast: vi.fn(),
	})),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom') as object;
	return {
		...actual,
		useParams: () => ({ room: 'testRoom' }),
		useNavigate: () => vi.fn(),
	};
});

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

describe('GamePage - handleKeydown', () => {
	let mockSocket: ReturnType<typeof createMockSocket>;
	let mockSetSocket: ReturnType<typeof vi.fn>;
	let mockNavigate: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockSocket = createMockSocket();
		mockSetSocket = vi.fn();
		mockNavigate = vi.fn();
		sessionStorage.setItem('uuid', 'testUuid');
		sessionStorage.setItem('name', 'testName');
		vi.spyOn(reactRouterDom, 'useNavigate').mockReturnValue(mockNavigate);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		sessionStorage.clear();
	});

	it('should call socket.emit with "moveRight" when ArrowRight is pressed', async () => {
		// Simulate beforeGame event to get out of waiting state
		render(
			<SocketContext.Provider value={{ socket: mockSocket, setSocket: mockSetSocket }}>
				<MemoryRouter>
					<GamePage />
				</MemoryRouter>
			</SocketContext.Provider>
		);

		// Simulate beforeGame to show the grid
		await waitFor(() => {
			mockSocket.__simulate('beforeGame', {
				player: {
					grid: Array(24).fill(null).map(() => Array(10).fill(0)),
					tetrominos: [],
					type: 101, // SINGLE
					roomId: 'testRoom',
				},
			});
		});

		const gridElement = screen.getByTestId('grid-container');
		fireEvent.keyDown(gridElement, { key: 'ArrowRight', code: 'ArrowRight' });

		expect(mockSocket.emit).toHaveBeenCalledWith('moveRight', { uuid: 'testUuid', roomId: 'testRoom' });
	});

	it('should call socket.emit with "moveLeft" when ArrowLeft is pressed', async () => {
		render(
			<SocketContext.Provider value={{ socket: mockSocket, setSocket: mockSetSocket }}>
				<MemoryRouter>
					<GamePage />
				</MemoryRouter>
			</SocketContext.Provider>
		);

		await waitFor(() => {
			mockSocket.__simulate('beforeGame', {
				player: {
					grid: Array(24).fill(null).map(() => Array(10).fill(0)),
					tetrominos: [],
					type: 101,
					roomId: 'testRoom',
				},
			});
		});

		const gridElement = screen.getByTestId('grid-container');
		fireEvent.keyDown(gridElement, { key: 'ArrowLeft', code: 'ArrowLeft' });

		expect(mockSocket.emit).toHaveBeenCalledWith('moveLeft', { uuid: 'testUuid', roomId: 'testRoom' });
	});

	it('should call socket.emit with "rotate" when ArrowUp is pressed', async () => {
		render(
			<SocketContext.Provider value={{ socket: mockSocket, setSocket: mockSetSocket }}>
				<MemoryRouter>
					<GamePage />
				</MemoryRouter>
			</SocketContext.Provider>
		);

		await waitFor(() => {
			mockSocket.__simulate('beforeGame', {
				player: {
					grid: Array(24).fill(null).map(() => Array(10).fill(0)),
					tetrominos: [],
					type: 101,
					roomId: 'testRoom',
				},
			});
		});

		const gridElement = screen.getByTestId('grid-container');
		fireEvent.keyDown(gridElement, { key: 'ArrowUp', code: 'ArrowUp' });

		expect(mockSocket.emit).toHaveBeenCalledWith('rotate', { uuid: 'testUuid', roomId: 'testRoom' });
	});

	it('should call socket.emit with "moveDown" when ArrowDown is pressed', async () => {
		render(
			<SocketContext.Provider value={{ socket: mockSocket, setSocket: mockSetSocket }}>
				<MemoryRouter>
					<GamePage />
				</MemoryRouter>
			</SocketContext.Provider>
		);

		await waitFor(() => {
			mockSocket.__simulate('beforeGame', {
				player: {
					grid: Array(24).fill(null).map(() => Array(10).fill(0)),
					tetrominos: [],
					type: 101,
					roomId: 'testRoom',
				},
			});
		});

		const gridElement = screen.getByTestId('grid-container');
		fireEvent.keyDown(gridElement, { key: 'ArrowDown', code: 'ArrowDown' });

		expect(mockSocket.emit).toHaveBeenCalledWith('moveDown', { uuid: 'testUuid', roomId: 'testRoom' });
	});

	it('should call socket.emit with "fallDown" when Space is pressed', async () => {
		render(
			<SocketContext.Provider value={{ socket: mockSocket, setSocket: mockSetSocket }}>
				<MemoryRouter>
					<GamePage />
				</MemoryRouter>
			</SocketContext.Provider>
		);

		await waitFor(() => {
			mockSocket.__simulate('beforeGame', {
				player: {
					grid: Array(24).fill(null).map(() => Array(10).fill(0)),
					tetrominos: [],
					type: 101,
					roomId: 'testRoom',
				},
			});
		});

		const gridElement = screen.getByTestId('grid-container');
		fireEvent.keyDown(gridElement, { key: ' ', code: 'Space' });

		expect(mockSocket.emit).toHaveBeenCalledWith('fallDown', { uuid: 'testUuid', roomId: 'testRoom' });
	});
});

describe('GamePage Component', () => {
	let mockSocket: ReturnType<typeof createMockSocket>;
	let mockSetSocket: ReturnType<typeof vi.fn>;
	let mockNavigate: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockSocket = createMockSocket();
		mockSetSocket = vi.fn();
		mockNavigate = vi.fn();
		sessionStorage.setItem('uuid', 'testUuid');
		sessionStorage.setItem('name', 'testName');
		vi.spyOn(reactRouterDom, 'useNavigate').mockReturnValue(mockNavigate);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		sessionStorage.clear();
	});

	it('renders the GamePage component', () => {
		render(
			<MemoryRouter>
				<SocketProvider>
					<GamePage />
				</SocketProvider>
			</MemoryRouter>
		);
		const linkElement = screen.getByTestId('waiting-logo');
		expect(document.body.contains(linkElement)).toBe(true);
	});

	it('displays countdown when countdown event is received', async () => {
		render(
			<SocketContext.Provider value={{ socket: mockSocket, setSocket: mockSetSocket }}>
				<MemoryRouter>
					<GamePage />
				</MemoryRouter>
			</SocketContext.Provider>
		);

		// First trigger beforeGame to show the grid
		await waitFor(() => {
			mockSocket.__simulate('beforeGame', {
				player: {
					grid: Array(24).fill(null).map(() => Array(10).fill(0)),
					tetrominos: [],
					type: 101,
					roomId: 'testRoom',
				},
			});
		});

		// Then trigger countdown event
		await waitFor(() => {
			mockSocket.__simulate('countdown', {
				roomId: 'testRoom',
				currentTime: 3,
			});
		});

		// Check if countdown is displayed
		await waitFor(() => {
			expect(screen.getByText('3')).toBeInTheDocument();
		});
	});

	it('displays game over screen with retry buttons when endGame event is received', async () => {
		render(
			<SocketContext.Provider value={{ socket: mockSocket, setSocket: mockSetSocket }}>
				<MemoryRouter>
					<GamePage />
				</MemoryRouter>
			</SocketContext.Provider>
		);

		// First trigger beforeGame to show the grid
		await waitFor(() => {
			mockSocket.__simulate('beforeGame', {
				player: {
					grid: Array(24).fill(null).map(() => Array(10).fill(0)),
					tetrominos: [],
					type: 101,
					roomId: 'testRoom',
				},
			});
		});

		// Trigger endGame event with winner = false
		await waitFor(() => {
			mockSocket.__simulate('endGame', {
				player: {
					roomId: 'testRoom',
					uuid: 'testUuid',
					winner: false,
					type: 101,
				},
			});
		});

		// Check if game over screen is displayed
		await waitFor(() => {
			expect(screen.getByText('GAME OVER')).toBeInTheDocument();
			expect(screen.getByText('Retry ?')).toBeInTheDocument();
			expect(screen.getByText('YES')).toBeInTheDocument();
			expect(screen.getByText('NO')).toBeInTheDocument();
		});
	});
});

describe('cellColorMainGrid', () => {
	it('should return the correct color for each cell', () => {
		expect(cellColorMainGrid(1)).toBe('bg-[#00ffff]');
		expect(cellColorMainGrid(2)).toBe('bg-[#0077ff]');
		expect(cellColorMainGrid(3)).toBe('bg-[#ff7f00]');
		expect(cellColorMainGrid(4)).toBe('bg-[#ffff00]');
		expect(cellColorMainGrid(5)).toBe('bg-[#00ff00]');
		expect(cellColorMainGrid(6)).toBe('bg-[#800080]');
		expect(cellColorMainGrid(7)).toBe('bg-[#ff0000]');
		expect(cellColorMainGrid(0)).toBe('bg-[#1a1b26]');
		expect(cellColorMainGrid(102)).toBe('bg-[#7d0202] opacity-75');
		expect(cellColorMainGrid(20)).toBe('bg-gray-500');
		expect(cellColorMainGrid(999)).toBe('bg-red-400');
	}
	);
});

describe('getTetroColor', () => {
	it('should return the correct color for each type of tetromino', () => {
		expect(getTetroColor('I')).toBe('bg-[#00ffff]');
		expect(getTetroColor('J')).toBe('bg-[#0077ff]');
		expect(getTetroColor('L')).toBe('bg-[#ff7f00]');
		expect(getTetroColor('O')).toBe('bg-[#ffff00]');
		expect(getTetroColor('S')).toBe('bg-[#00ff00]');
		expect(getTetroColor('T')).toBe('bg-[#800080]');
		expect(getTetroColor('Z')).toBe('bg-[#ff0000]');
	});
});

describe('displayTetromino', () => {
	it('should display tetromino correctly', () => {
		const tetromino = {
			type: 'I',
			shape: [
				[0, 0, 0, 0],
				[1, 1, 1, 1],
				[0, 0, 0, 0],
				[0, 0, 0, 0]
			]
		};

		render(
			<div>
				{displayTetromino(tetromino)}
			</div>
		);

		const row1 = screen.getByTestId('0');
		const row2 = screen.getByTestId('1');
		const row3 = screen.getByTestId('2');
		const row4 = screen.getByTestId('3');

		expect(document.body.contains(row1)).toBe(true);
		expect(document.body.contains(row2)).toBe(true);
		expect(document.body.contains(row3)).toBe(true);
		expect(document.body.contains(row4)).toBe(true);

		expect(row1.children.length).toBe(4);
		expect(row2.children.length).toBe(4);
		expect(row3.children.length).toBe(4);
		expect(row4.children.length).toBe(4);

		expect(row1.children[0].className).contains('bg-transparent');
		expect(row2.children[0].className).not.contains('bg-transparent');
		expect(row3.children[0].className).contains('bg-transparent');
		expect(row4.children[0].className).contains('bg-transparent');
	});
});

describe('displaySpectrums', () => {
	it('should display spectrums correctly', () => {

		const specList = [
			{
				name: 'Player1',
				spectrum: Array(20).fill([0, 1, 0, 1, 0, 1, 0, 1, 0, 1])
			},
			{
				name: 'Player2',
				spectrum: Array(20).fill([1, 0, 1, 0, 1, 0, 1, 0, 1, 0])
			}
		];

		render(
			<div>
				{displaySpectrums(specList, true)}
				{displaySpectrums(specList, false)}
			</div>
		);

		const player1 = screen.getByText('Player1');
		const player2 = screen.getByText('Player2');

		expect(document.body.contains(player1)).toBe(true);
		expect(document.body.contains(player2)).toBe(true);
	});

});
