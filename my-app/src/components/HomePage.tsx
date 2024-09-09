import React, { useState } from 'react';
import "../index.css"

function HomePage() {

	const [name, setName] = useState('');

	const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		event.preventDefault();
		setName(event.target.value);
	};

	const handleSubmit = () => {
		if (name.length == 0) {
			console.log("the name is empty");
		}
		else {
			console.log(name + " is good");
		}
	}

	return (
		<div>
			<h1 className="text-red-500 font-bold">Please write your player name to access the site</h1>
			<div>
				<input 	type="text"
						className="bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
						placeholder="Type here..."
						onChange={() => handleChange}
						/>
			</div>
			<div></div>
			<button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full" onClick={handleSubmit}>Confirm</button>
		</div>
	);
}

export default HomePage;
