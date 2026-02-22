
import React, { Dispatch } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConnectPage from '../components/ConnectPage';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from "@socket.io/component-emitter";

// Mock socket.io-client
vi.mock('socket.io-client', async () => {
	const actual = await vi.importActual('socket.io-client');
	return {
		...actual,
		io: vi.fn(),
	};
});

import { io } from 'socket.io-client';

describe('ConnectPage Component', () => {
	let setName: Dispatch<React.SetStateAction<string>>;
	let setUuid: Dispatch<React.SetStateAction<string | undefined>>;
	let setSocket: Dispatch<React.SetStateAction<Socket<DefaultEventsMap, DefaultEventsMap> | undefined>>

	beforeEach(() => {
		// Mock des fonctions d'état
		setName = vi.fn();
		setUuid = vi.fn();
		setSocket = vi.fn();
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
				setSocket={setSocket}
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
				setSocket={setSocket}
			/>
		);

		const input = screen.getByPlaceholderText('Player name');
		await userEvent.type(input, 'Player1');

		// Vérifie que la fonction setName a été appelée avec la bonne valeur
		expect(setName).toHaveBeenCalledTimes(7); // "Player1" a 7 caractères
		expect(setName).toHaveBeenCalledWith('P'); // Appelé avec chaque caractère
	});

	it('calls setSocket on button click', () => {
		const onMock = vi.fn();
		const mockNewSocket = { on: onMock, io: { uri: 'http://localhost:3000' } } as any;
		(io as any).mockReturnValue(mockNewSocket);

		render(
			<ConnectPage
				name="Player1"
				setName={setName}
				uuid="1234"
				setUuid={setUuid}
				socket={undefined}
				setSocket={setSocket}
			/>
		);

		const button = screen.getByText('CONFIRM');
		fireEvent.click(button);

		// Vérifie que setSocket a été appelé
		expect(setSocket).toHaveBeenCalled();
	});

	it('handles "new-person" socket event correctly', () => {
		// Mock sessionStorage
		vi.stubGlobal('sessionStorage', {
			setItem: vi.fn(),
			getItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
		});

		// Mock io() to return a fake socket
		const onMock = vi.fn();
		const mockNewSocket = { on: onMock, io: { uri: 'http://localhost:3000' } } as any;
		(io as any).mockReturnValue(mockNewSocket);

		render(
			<ConnectPage
				name="Player1"
				setName={setName}
				uuid="1234"
				setUuid={setUuid}
				socket={undefined}
				setSocket={setSocket}
			/>
		);

		// Click CONFIRM to trigger handleSubmit which creates the socket and registers the listener
		const button = screen.getByText('CONFIRM');
		fireEvent.click(button);

		// Now the "new-person" listener should have been registered on the new socket
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
