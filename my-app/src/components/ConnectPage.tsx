import React, { useState } from 'react';
import "../index.css"
import { usePlayer } from '../contexts/playerContext';

function ConnectPage() {

	const playerContext = usePlayer();

	if (!playerContext) {
		throw new Error('ConnectPage must be used within a PlayerProvider');
	}

	const [name, setName] = useState<string>("");

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();
		setName(event.target.value);
	};

	const handleSubmit = () => {
		if (name.length == 0) {
			console.log("the name is empty");
		}
		else {
			console.log(name + " is good");
			playerContext.setName(name);
		}
	}

	return (
		<div className="flex items-center justify-center h-screen bg-black">
			<div className="text-center">
				<h1 className="text-red-500 font-bold">WELCOME TO RED TETRIS</h1>
				<h1 className="text-red-500 font-bold">Please write your player name to access the site</h1>
				<div className="m-5"></div>
				<div>
					<input type="text"
						className="bg-transparent placeholder:text-white text-white text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
						placeholder="Type here..."
						onChange={handleChange}
					/>
				</div>
				<div className="m-5"></div>
				<button className="bg-red-500 hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full" onClick={handleSubmit}>Confirm</button>
			</div>
		</div>
	);
}

export default ConnectPage;
