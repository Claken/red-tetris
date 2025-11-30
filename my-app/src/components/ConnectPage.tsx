import React, { Dispatch } from 'react';
import "../index.css"
import { io, Socket } from 'socket.io-client'

function ConnectPage({ name, setName, uuid, setUuid, socket, setSocket }: {
	name: string,
	setName: Dispatch<React.SetStateAction<string>>,
	uuid: string | undefined,
	setUuid: Dispatch<React.SetStateAction<string | undefined>>,
	socket: Socket | undefined,
	setSocket: React.Dispatch<React.SetStateAction<Socket | undefined>>;
}
) {

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();
		setName(event.target.value);
	};

	const handleSubmit = () => {
		setSocket(
			io("http://localhost:3000", {
				query: { name: name, uuid: uuid },
			})
		);
	}

	socket?.on("new-person", (data) => {
		console.log("new-person");
		console.log(data);
		sessionStorage.setItem("uuid", data.uuid);
		const newUuid = data.uuid;
		setUuid(newUuid);
		sessionStorage.setItem("name", data.name);
	});

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
