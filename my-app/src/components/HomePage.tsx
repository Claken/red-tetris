import "../index.css"
import { usePlayer } from '../contexts/playerContext';
import ConnectPage from './ConnectPage';

function HomePage() {

	const playerContext = usePlayer();

	if (!playerContext) {
		throw new Error('ConnectPage must be used within a PlayerProvider');
	}

	return (
		playerContext.name ?
			<div className="bg-black h-screen">
				<div className="flex items-center justify-center h-screen">
					<div className="relative border-4 border-red-500 w-64 h-96">
						<div className='text-center space-y-3'>
							<button className="bg-red-500 hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full" onClick={() => { }}>Join a solo game</button>
							<button className="bg-red-500 hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full" onClick={() => { }}>Join a game</button>

						</div>
					</div>
				</div>
			</div>
			: <ConnectPage />
	);
}

export default HomePage;

