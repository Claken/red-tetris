import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from '../store/reactReduxLite';
import { cellColorMainGrid, getTetroColor, displayTetromino, displaySpectrums } from '../functions/forTheGame';
import GamePage from '../components/GamePage';
import { MemoryRouter } from 'react-router-dom';
import { SocketProvider } from '../contexts/socketContext';
import { createTestStore } from './testStore';
import { socketEmit } from '../store/socketActions';
import React from 'react';
import '@testing-library/jest-dom';
import * as reactRouterDom from 'react-router-dom';

vi.mock("toastify-js", () => ({
	default: vi.fn(() => ({
		showToast: vi.fn(),
	})),
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom') as object;
	return {
		...actual,
		useParams: () => ({ room: 'testRoom' }),
		useNavigate: () => vi.fn(),
	};
});

const renderGame = (autoConnect = true) => {
	const ctx = createTestStore({ autoConnect });
	const utils = render(
		<Provider store={ctx.store}>
			<MemoryRouter>
				<SocketProvider>
					<GamePage />
				</SocketProvider>
			</MemoryRouter>
		</Provider>
	);
	return { ...ctx, ...utils };
};

describe('GamePage - handleKeydown', () => {
	let mockNavigate: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockNavigate = vi.fn();
		sessionStorage.setItem('uuid', 'testUuid');
		sessionStorage.setItem('name', 'testName');
		vi.spyOn(reactRouterDom, 'useNavigate').mockReturnValue(mockNavigate);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		sessionStorage.clear();
	});

	it('should dispatch "moveRight" when ArrowRight is pressed', async () => {
		const { store, simulate } = renderGame();
		const dispatchSpy = vi.spyOn(store, 'dispatch');

		await waitFor(() => {
			simulate('beforeGame', {
				player: {
					grid: Array(24).fill(null).map(() => Array(10).fill(0)),
					tetrominos: [],
					type: 101,
					roomId: 'testRoom',
				},
			});
		});

		const gridElement = screen.getByTestId('grid-container');
		fireEvent.keyDown(gridElement, { key: 'ArrowRight', code: 'ArrowRight' });

		expect(dispatchSpy).toHaveBeenCalledWith(
			socketEmit({ event: 'moveRight', payload: { uuid: 'testUuid', roomId: 'testRoom' } })
		);
	});

	it('should dispatch "moveLeft" when ArrowLeft is pressed', async () => {
		const { store, simulate } = renderGame();
		const dispatchSpy = vi.spyOn(store, 'dispatch');

		await waitFor(() => {
			simulate('beforeGame', {
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

		expect(dispatchSpy).toHaveBeenCalledWith(
			socketEmit({ event: 'moveLeft', payload: { uuid: 'testUuid', roomId: 'testRoom' } })
		);
	});

	it('should dispatch "rotate" when ArrowUp is pressed', async () => {
		const { store, simulate } = renderGame();
		const dispatchSpy = vi.spyOn(store, 'dispatch');

		await waitFor(() => {
			simulate('beforeGame', {
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

		expect(dispatchSpy).toHaveBeenCalledWith(
			socketEmit({ event: 'rotate', payload: { uuid: 'testUuid', roomId: 'testRoom' } })
		);
	});

	it('should dispatch "moveDown" when ArrowDown is pressed', async () => {
		const { store, simulate } = renderGame();
		const dispatchSpy = vi.spyOn(store, 'dispatch');

		await waitFor(() => {
			simulate('beforeGame', {
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

		expect(dispatchSpy).toHaveBeenCalledWith(
			socketEmit({ event: 'moveDown', payload: { uuid: 'testUuid', roomId: 'testRoom' } })
		);
	});

	it('should dispatch "fallDown" when Space is pressed', async () => {
		const { store, simulate } = renderGame();
		const dispatchSpy = vi.spyOn(store, 'dispatch');

		await waitFor(() => {
			simulate('beforeGame', {
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

		expect(dispatchSpy).toHaveBeenCalledWith(
			socketEmit({ event: 'fallDown', payload: { uuid: 'testUuid', roomId: 'testRoom' } })
		);
	});
});

describe('GamePage Component', () => {
	let mockNavigate: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockNavigate = vi.fn();
		sessionStorage.setItem('uuid', 'testUuid');
		sessionStorage.setItem('name', 'testName');
		vi.spyOn(reactRouterDom, 'useNavigate').mockReturnValue(mockNavigate);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		sessionStorage.clear();
	});

	it('renders the GamePage component with lobby', () => {
		renderGame();
		expect(screen.getByText('RED TETRIS')).toBeInTheDocument();
		expect(screen.getByText('Leave Room')).toBeInTheDocument();
	});

	it('displays countdown when countdown event is received', async () => {
		const { simulate } = renderGame();

		await waitFor(() => {
			simulate('beforeGame', {
				player: {
					grid: Array(24).fill(null).map(() => Array(10).fill(0)),
					tetrominos: [],
					type: 101,
					roomId: 'testRoom',
				},
			});
		});

		await waitFor(() => {
			simulate('countdown', {
				roomId: 'testRoom',
				currentTime: 3,
			});
		});

		await waitFor(() => {
			expect(screen.getByText('3')).toBeInTheDocument();
		});
	});

	it('displays game over screen with retry buttons when endGame event is received', async () => {
		const { simulate } = renderGame();

		await waitFor(() => {
			simulate('beforeGame', {
				player: {
					grid: Array(24).fill(null).map(() => Array(10).fill(0)),
					tetrominos: [],
					type: 101,
					roomId: 'testRoom',
				},
			});
		});

		await waitFor(() => {
			simulate('endGame', {
				player: {
					roomId: 'testRoom',
					uuid: 'testUuid',
					winner: false,
					type: 101,
				},
			});
		});

		await waitFor(() => {
			expect(screen.getByText('GAME OVER')).toBeInTheDocument();
			expect(screen.getByText('Back to lobby?')).toBeInTheDocument();
			expect(screen.getByText('LOBBY')).toBeInTheDocument();
			expect(screen.getByText('MENU')).toBeInTheDocument();
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

describe('GamePage targeted coverage flows', () => {
	let mockNavigate: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockNavigate = vi.fn();
		sessionStorage.setItem('uuid', 'testUuid');
		sessionStorage.setItem('name', 'testName');
		vi.spyOn(reactRouterDom, 'useNavigate').mockReturnValue(mockNavigate);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		sessionStorage.clear();
	});

	it('navigates home when room join fails', async () => {
		const { simulate } = renderGame();

		await waitFor(() => {
			simulate('room_join_failed', {
				roomId: 'testRoom',
				reason: 'game_started',
			});
		});

		expect(mockNavigate).toHaveBeenCalledWith('/');
	});

	it('allows host to start room when enough players', async () => {
		const { store, simulate } = renderGame();
		const dispatchSpy = vi.spyOn(store, 'dispatch');

		simulate('room_players_update', {
			roomId: 'testRoom',
			hostUuid: 'testUuid',
			isStarted: false,
			players: [
				{ name: 'Host', uuid: 'testUuid', isHost: true },
				{ name: 'Guest', uuid: 'guestUuid', isHost: false },
			],
		});

		const startButton = await screen.findByRole('button', { name: 'Start Game' });
		expect(startButton).toBeEnabled();
		fireEvent.click(startButton);

		expect(dispatchSpy).toHaveBeenCalledWith(
			socketEmit({ event: 'startRoom', payload: { uuid: 'testUuid', roomId: 'testRoom' } })
		);
	});

	it('retries solo game from legacy gameover screen', async () => {
		vi.spyOn(reactRouterDom, 'useLocation').mockReturnValue({ state: { legacy: true } } as any);

		const { store, simulate } = renderGame();
		const dispatchSpy = vi.spyOn(store, 'dispatch');

		simulate('beforeGame', {
			player: {
				grid: Array(24).fill(null).map(() => Array(10).fill(0)),
				tetrominos: [],
				type: 101,
				roomId: 'testRoom',
			},
		});

		simulate('endGame', {
			player: {
				roomId: 'testRoom',
				uuid: 'testUuid',
				winner: false,
				type: 101,
			},
		});

		const retryButton = await screen.findByRole('button', { name: 'RETRY' });
		fireEvent.click(retryButton);

		expect(dispatchSpy).toHaveBeenCalledWith(
			socketEmit({ event: 'startSingleTetrisGame', payload: { name: '', uuid: 'testUuid' } })
		);
	});
});
