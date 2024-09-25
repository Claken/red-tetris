import { useSocket } from "../contexts/socketContext";
import "../index.css"
import ConnectPage from './ConnectPage';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from 'socket.io-client'

function HomePage() {

	const [isWaiting, setWaiting] = useState<boolean>(false);
	const navigate = useNavigate();
	const socketContext = useSocket();
	const [name, setName] = useState<string>("");
	const [uuid, setUuid] = useState<string | undefined>(undefined);

	if (!socketContext) {
		throw new Error('ConnectPage must be used within a SocketProvider');
	}

	const { socket, setSocket } = socketContext;

	const handleJoinSolo = () => {
		// TEST
		// COMMENT SAVOIR COMBIEN IL Y A DE ROOMS ?
		// const name = playerContext.name;
		const route = "/room00/" + name;
		navigate(route);
	}

	const handleJoinGame = () => {
		// A COMPLETER
		setWaiting(true);
	}

	const WaitingLogo = (): JSX.Element => {
		return <div className="flex items-center justify-center h-screen">
			<div className="text center space-y-4">
				<div className="text-red-600">
					WAITING FOR A GAME
				</div>
				<div className="mx-auto w-16 h-16 border-4 border-t-4 border-red-200 rounded-full animate-spin border-t-red-500"></div>
			</div>
		</div>
	}

	useEffect(() => {
		const uuid = sessionStorage.getItem("uuid");
		const name = sessionStorage.getItem("name");
		if (uuid && name) {
			setUuid(uuid);
			setName(name);
			if (uuid && name) {
				setSocket(
					io("http://localhost:3000", {
						query: { name: name, uuid: uuid },
					})
				);
			} else {
				console.log(`uuid or name is undefined ${uuid} ${name}`);
			}
		}
	}, []);

	return (
		sessionStorage.getItem("name") ?
			<div className="bg-black h-screen">
				{isWaiting == false ?
					<div className="flex items-center justify-center h-screen">
						<div className="relative border-4 border-red-500 w-64 h-96">
							<div className="flex flex-col my-8 space-y-5 p-10">
								<button className="bg-red-500 hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full" onClick={handleJoinSolo}>Solo game</button>
								<button className="bg-red-500 hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full" onClick={handleJoinGame}>Join a game</button>
							</div>
						</div>
					</div>
					:
					<WaitingLogo />
				}
			</div>
			: ConnectPage({ name: name, setName: setName, uuid: uuid, setUuid: setUuid, socket: socket, setSocket: setSocket })
	);
}

export default HomePage;

