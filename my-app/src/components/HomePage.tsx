import "../index.css"
import { usePlayer } from '../contexts/playerContext';
import ConnectPage from './ConnectPage';
import { useState } from "react";

function HomePage() {

	const [isWaiting, setWaiting] = useState<boolean>(false);
	const playerContext = usePlayer();

	if (!playerContext) {
		throw new Error('ConnectPage must be used within a PlayerProvider');
	}

	const handleJoinSolo = () => {

	}

	const handleJoinGame = () => {
		setWaiting(true);
	}

	return (
		playerContext.name ?
			<div className="bg-black h-screen">
				{isWaiting == false ?
					<div className="flex items-center justify-center h-screen">
						<div className="relative border-4 border-red-500 w-64 h-96">
							<div className='text-center space-y-10 my-10'>
								<button className="bg-red-500 hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full" onClick={handleJoinSolo}>Join a solo game</button>
								<button className="bg-red-500 hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full" onClick={handleJoinGame}>Join a game</button>
							</div>
						</div>
					</div>
					:
					<div className="flex items-center justify-center h-screen">
						<div className="text-center">
							<div className="text-red-600">
								WAITING FOR A GAME
							</div>
							<div className="w-16 h-16 border-4 border-t-4 border-red-200 rounded-full animate-spin border-t-red-500"></div>
						</div>
					</div>
				}
			</div>
			: <ConnectPage />
	);
}

export default HomePage;

