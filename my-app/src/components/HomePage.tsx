import React, { useState } from 'react';

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
			<h1 className="text-3xl font-bold underline">Please write your player name to access the site</h1>
			<textarea
        		value={name}
        		onChange={handleChange}
       			placeholder="Type here..."
      		/>
			<div></div>
			 <button onClick={handleSubmit}>Confirm</button>
		</div>
	);
}

export default HomePage;