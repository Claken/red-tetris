
import React, { Dispatch } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConnectPage from '../components/ConnectPage';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from "@socket.io/component-emitter";

describe('ConnectPage Component', () => {
	let setName: Dispatch<React.SetStateAction<string>>;
	let setUuid: Dispatch<React.SetStateAction<string | undefined>>;
	let setSocket: Dispatch<React.SetStateAction<Socket<DefaultEventsMap, DefaultEventsMap> | undefined>>

	beforeEach(() => {
		// Mock des fonctions d'état
		setName = vi.fn();
		setUuid = vi.fn();
		setSocket = vi.fn();
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
		expect(setSocket.mock.calls[0][0].io.uri).toBe('http://localhost:3000');
	});

	it('handles "new-person" socket event correctly', () => {
		// Mock sessionStorage
		vi.stubGlobal('sessionStorage', {
			setItem: vi.fn(),
			getItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
		});

		// Fake socket avec mock du `.on()` pour capturer le callback
		const onMock = vi.fn();
		const mockSocket = { on: onMock } as any;

		render(
			<ConnectPage
				name="Player1"
				setName={setName}
				uuid="1234"
				setUuid={setUuid}
				socket={mockSocket}
				setSocket={setSocket}
			/>
		);

		// simulate `socket.on` registering the "new-person" listener
		expect(onMock).toHaveBeenCalledWith("new-person", expect.any(Function));
		const newPersonCallback = onMock.mock.calls.find(call => call[0] === "new-person")[1];

		// simulate reception of the event
		const mockData = { uuid: "mock-uuid", name: "MockName" };
		newPersonCallback(mockData);

		expect(sessionStorage.setItem).toHaveBeenCalledWith("uuid", "mock-uuid");
		expect(sessionStorage.setItem).toHaveBeenCalledWith("name", "MockName");
		expect(setUuid).toHaveBeenCalledWith("mock-uuid");
	});
});
