
import React, { Dispatch } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConnectPage from '../components/ConnectPage';
import { Socket } from 'socket.io-client';

describe('ConnectPage Component', () => {
	let setName: Dispatch<React.SetStateAction<string>>;
	let setUuid: Dispatch<React.SetStateAction<string | undefined>>;
	let connectSocket: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		setName = vi.fn();
		setUuid = vi.fn();
		connectSocket = vi.fn();
		vi.clearAllMocks();
	});

	it('renders the component correctly', () => {
		render(
			<ConnectPage
				name=""
				setName={setName}
				uuid={undefined}
				setUuid={setUuid}
				socket={undefined}
				connectSocket={connectSocket}
			/>
		);

		// Vérifie que le titre et les éléments principaux sont rendus
		const textWelcome = screen.getByText('WELCOME TO RED TETRIS');
		expect(document.body.contains(textWelcome)).toBe(true);

		const confirmText = screen.getByText('CONFIRM');
		expect(document.body.contains(confirmText)).toBe(true);
	});

	it('updates the name state when typing in the input', async () => {
		render(
			<ConnectPage
				name=""
				setName={setName}
				uuid={undefined}
				setUuid={setUuid}
				socket={undefined}
				connectSocket={connectSocket}
			/>
		);

		const input = screen.getByPlaceholderText('Player name');
		await userEvent.type(input, 'Player1');

		// Vérifie que la fonction setName a été appelée avec la bonne valeur
		expect(setName).toHaveBeenCalledTimes(7); // "Player1" a 7 caractères
		expect(setName).toHaveBeenCalledWith('P'); // Appelé avec chaque caractère
	});

	it('calls connectSocket on button click', () => {
		render(
			<ConnectPage
				name="Player1"
				setName={setName}
				uuid="1234"
				setUuid={setUuid}
				socket={undefined}
				connectSocket={connectSocket}
			/>
		);

		const button = screen.getByText('CONFIRM');
		fireEvent.click(button);

		// Vérifie que connectSocket a été appelé avec les bons arguments
		expect(connectSocket).toHaveBeenCalledWith('Player1', '1234');
	});

	it('handles "new-person" socket event correctly', () => {
		// Mock sessionStorage
		vi.stubGlobal('sessionStorage', {
			setItem: vi.fn(),
			getItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
		});

		// Provide a mock socket to trigger the useEffect listener
		const onMock = vi.fn();
		const offMock = vi.fn();
		const mockSocket = { on: onMock, off: offMock } as unknown as Socket;

		render(
			<ConnectPage
				name="Player1"
				setName={setName}
				uuid="1234"
				setUuid={setUuid}
				socket={mockSocket}
				connectSocket={connectSocket}
			/>
		);

		// The useEffect should have registered the new-person listener
		expect(onMock).toHaveBeenCalledWith("new-person", expect.any(Function));
		const newPersonCallback = onMock.mock.calls.find(call => call[0] === "new-person")![1];

		// simulate reception of the event
		const mockData = { uuid: "mock-uuid", name: "MockName" };
		newPersonCallback(mockData);

		expect(sessionStorage.setItem).toHaveBeenCalledWith("uuid", "mock-uuid");
		expect(sessionStorage.setItem).toHaveBeenCalledWith("name", "MockName");
		expect(setUuid).toHaveBeenCalledWith("mock-uuid");
	});
});
