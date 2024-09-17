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
		<div className="text-white">
			HOME PAGE
		</div>
		: <ConnectPage/>
	);
}

export default HomePage;
