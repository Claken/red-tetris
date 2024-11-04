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
		sessionStorage.setItem("name", data.name);
		setUuid(data.uuid);
	});

	return (
		<div className="flex items-center justify-center h-screen bg-black">
			<div className="flex flex-col justify-center items-center rounded-md bg-red-500">
				<div className="text-white text-3xl font-bold p-2 m-4 bg-red-500 border-4 border-red-500 w-fit">WELCOME TO RED TETRIS</div>
				<div className="text-white text-center font-bold text-sm p-2 bg-red-900 border border-white w-full">↓ Please write your player name to access the site ↓</div>
				<div className="m-3">
					<input type="text"
						className="bg-red-900 placeholder:text-white placeholder:opacity-60 text-white font-bold border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
						placeholder="Player name"
						onChange={handleChange}
					/>
				</div>
					<button className="bg-red-900 rounded-b-md hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 w-full" onClick={handleSubmit}>CONFIRM</button>
			</div>
		</div>
	);
}

export default ConnectPage;
