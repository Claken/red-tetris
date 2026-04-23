import React, { Dispatch, useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from '../store/reactReduxLite';
import ConnectPage from '../components/ConnectPage';
import { createTestStore } from './testStore';
import { connectSocket } from '../store/socketActions';

function Wrapper({
	name,
	setName,
	uuid,
	setUuid,
	store,
}: {
	name: string;
	setName: Dispatch<React.SetStateAction<string>>;
	uuid: string | undefined;
	setUuid: Dispatch<React.SetStateAction<string | undefined>>;
	store: ReturnType<typeof createTestStore>["store"];
}) {
	return (
		<Provider store={store}>
			<ConnectPage
				name={name}
				setName={setName}
				uuid={uuid}
				setUuid={setUuid}
			/>
		</Provider>
	);
}

describe('ConnectPage Component', () => {
	let setName: Dispatch<React.SetStateAction<string>>;
	let setUuid: Dispatch<React.SetStateAction<string | undefined>>;

	beforeEach(() => {
		setName = vi.fn();
		setUuid = vi.fn();
	});

	it('renders the component correctly', () => {
		const { store } = createTestStore();
		render(
			<Wrapper
				name=""
				setName={setName}
				uuid={undefined}
				setUuid={setUuid}
				store={store}
			/>
		);

		const textWelcome = screen.getByText('WELCOME TO RED TETRIS');
		expect(document.body.contains(textWelcome)).toBe(true);

		const confirmText = screen.getByText('CONFIRM');
		expect(document.body.contains(confirmText)).toBe(true);
	});

	it('updates the name state when typing in the input', async () => {
		const { store } = createTestStore();
		render(
			<Wrapper
				name=""
				setName={setName}
				uuid={undefined}
				setUuid={setUuid}
				store={store}
			/>
		);

		const input = screen.getByPlaceholderText('Player name');
		await userEvent.type(input, 'Player1');

		expect(setName).toHaveBeenCalledTimes(7);
		expect(setName).toHaveBeenCalledWith('P');
	});

	it('dispatches connectSocket on button click', () => {
		const { store } = createTestStore();
		const dispatchSpy = vi.spyOn(store, 'dispatch');

		render(
			<Wrapper
				name="Player1"
				setName={setName}
				uuid="1234"
				setUuid={setUuid}
				store={store}
			/>
		);

		const button = screen.getByText('CONFIRM');
		fireEvent.click(button);

		expect(dispatchSpy).toHaveBeenCalledWith(
			connectSocket({ name: 'Player1', uuid: '1234' })
		);
	});

	it('handles "new-person" socket event correctly', () => {
		vi.stubGlobal('sessionStorage', {
			setItem: vi.fn(),
			getItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
		});

		const { store, simulate } = createTestStore();

		render(
			<Wrapper
				name="Player1"
				setName={setName}
				uuid="1234"
				setUuid={setUuid}
				store={store}
			/>
		);

		simulate('new-person', { uuid: 'mock-uuid', name: 'MockName' });

		expect(sessionStorage.setItem).toHaveBeenCalledWith('uuid', 'mock-uuid');
		expect(sessionStorage.setItem).toHaveBeenCalledWith('name', 'MockName');
		expect(setUuid).toHaveBeenCalledWith('mock-uuid');
	});
});
