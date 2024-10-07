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
	const [roomId, setRoomId] = useState<string>("");
	const [route, setRoute] = useState<string>("");

	if (!socketContext) {
		throw new Error('ConnectPage must be used within a SocketProvider');
	}

	const { socket, setSocket } = socketContext;

	const goToGameRoom = () => {
		console.log("go to game")
		navigate(route);
	}

	const handleJoinSolo = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		// socket?.emit("StartSingleTetrisGame");
		// goToGameRoom();
	}

	const handleJoinGame = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		socket?.emit("playerPlayMulti", { name: name, uuid: uuid });
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

	socket?.on("waitToPlay", (data) => {
		setRoomId(data.roomId);
		const roomName = roomId === "" ? data.roomId : roomId;
		const goToRoute = "/" + roomName + "/" + name;
		setRoute(goToRoute);
		setWaiting(true);
	});

	socket?.on("changePage", () => {
		setWaiting(false);
		goToGameRoom();
	});

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
						<div className="text-center">
							<h1 className="bg-red-500 text-white font-bold text-3xl">RED TETRIS</h1>
							<div className="relative border-4 border-red-500 w-64 h-96">
								<div className="flex flex-col my-1 space-y-5 p-10">
									<button className="bg-red-500 hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full"
										onClick={handleJoinSolo}>
										Solo game
										<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="" strokeWidth={1.5} stroke="currentColor" className="size-6">
											<path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
										</svg>
									</button>
									<button className="bg-red-500 hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full" onClick={() => { }}>Create a room</button>
									<button className="bg-red-500 hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full" onClick={() => { }}>ALL MY ROOMS</button>
									<button className="bg-red-500 hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full" onClick={handleJoinGame}>Join a game</button>
									<button className="bg-red-500 hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full" onClick={() => { }}>Go back to a game</button>
								</div>
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
