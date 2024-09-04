import React, { useState } from 'react';

function HomePage() {

	const [text, setText] = useState('');

	const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setText(event.target.value);
	  };

	return (
		<div>
			<h1>Please write your player name to access the site</h1>
			<textarea
        		value={text}
        		onChange={handleChange}
       			placeholder="Type here..."
      		/>
			<div></div>
			 <button onClick={() => {}}>Confirm</button>
		</div>
	);
}

export default HomePage;