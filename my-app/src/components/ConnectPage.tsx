import React, { Dispatch, useEffect } from 'react';
import "../index.css"
import { Socket } from 'socket.io-client'

// Props for the ConnectPage component
// name: string - the name of the user
// setName: Dispatch<React.SetStateAction<string>> - the function to set the name of the user
// uuid: string | undefined - the UUID of the user
// setUuid: Dispatch<React.SetStateAction<string | undefined>> - the function to set the UUID of the user
// socket: Socket | undefined - the socket connection
// connectSocket: (name: string, uuid?: string) => void - the function to connect to the socket
function ConnectPage({ name, setName, uuid, setUuid, socket, connectSocket }: {
	name: string,
	setName: Dispatch<React.SetStateAction<string>>,
	uuid: string | undefined,
	setUuid: Dispatch<React.SetStateAction<string | undefined>>,
	socket: Socket | undefined,
	connectSocket: (name: string, uuid?: string) => void;
}
) {

	//  Set user name
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();
		setName(event.target.value);
	};

	// Handle submit button click
	const handleSubmit = () => {
		connectSocket(name, uuid);
	}

	// Handle new-person event (first connection, server assigns UUID)
	useEffect(() => {
		socket?.on("new-person", (data) => {
			sessionStorage.setItem("uuid", data.uuid);
			setUuid(data.uuid);
			sessionStorage.setItem("name", data.name);
		});
		return () => {
			socket?.off("new-person");
		};
	}, [socket]);

	// Render the component
	return (
		<div data-testid="connect-page" className="flex items-center justify-center h-screen bg-[#1a1b26]">
			<div className="flex flex-col justify-center items-center border-4 border-gray-700 rounded-lg bg-gray-900">
				<div className="text-white text-3xl font-bold p-2 m-4 w-fit">WELCOME TO RED TETRIS</div>
				<div className="text-white text-center font-bold text-sm p-2 bg-gray-800 border-y-2 border-gray-700 w-full">↓ Please write your player name to access the site ↓</div>
				<div className="m-3">
					<input type="text"
						className="bg-gray-800 placeholder:text-white placeholder:opacity-60 text-white font-bold border-2 border-gray-700 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-gray-600 hover:border-gray-600 shadow-sm focus:shadow"
						placeholder="Player name"
						maxLength={20}
						onChange={handleChange}
					/>
				</div>
					<button className="bg-red-700 hover:bg-red-800 active:bg-red-700 rounded-md text-white font-bold py-2 px-4 w-full transition-all duration-200" onClick={handleSubmit}>CONFIRM</button>
			</div>
		</div>
	);
}

export default ConnectPage;
