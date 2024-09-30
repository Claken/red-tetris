import { useState } from "react";
import { useSocket } from "../contexts/socketContext";

function GamePage() {

	const socketContext = useSocket();

	if (!socketContext) {
		throw new Error('ConnectPage must be used within a SocketProvider');
	}

	const { socket } = socketContext;
	const uuid = sessionStorage.getItem("uuid");
	const [roomId, setRoomId] = useState<string>("");
	const [countdown, setCountdown] = useState<number | null>(null);
	const numRows = 20;
	const numCols = 10;
	const emptyGrid = Array.from({ length: numRows }, () => Array(numCols).fill(0));

	const [grid, setGrid] = useState<number[][]>(emptyGrid);
	const [oppGrid, setOppGrid] = useState<number[][]>(emptyGrid);


	const handleKeydown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		console.log(e.key);
		console.log("key beach");
		if (e.key === "ArrowRight") {
			socket?.emit("moveRight", { uuid: uuid, roomId: roomId });
		} else if (e.key === "ArrowLeft") {
			socket?.emit("moveLeft", { uuid: uuid, roomId: roomId });
		} else if (e.key === "ArrowUp") {
			socket?.emit("rotate", { uuid: uuid, roomId: roomId });
		} else if (e.key === "ArrowDown") {
			socket?.emit("moveDown", { uuid: uuid, roomId: roomId });
		} else if (e.key === " ") {
			socket?.emit("fallDown", { uuid: uuid, roomId: roomId });
		}
	};

	socket?.on("countdown", (data) => {
		setCountdown(data.currentTime === 0 ? null : data.currentTime);
	});

	socket?.on("beforeGame", (data) => {
		console.log("beforeGame");
		setGrid(data.player1.uuid === uuid ? data.player1.grid : data.player2.grid);
		setOppGrid(data.player1.uuid === uuid ? data.player2.grid : data.player1.grid);
		setRoomId(data.player1.roomId);
	});

	socket?.on("game", (data) => {
		setGrid(data.player1.uuid === uuid ? data.player1.grid : data.player2.grid);
		setOppGrid(data.player1.uuid === uuid ? data.player2.grid : data.player1.grid);
		if (roomId != "") {
			setRoomId(data.player1.roomId);
		}
	});

	socket?.on("endGame", () => {
		setGrid(emptyGrid);
		setOppGrid(emptyGrid);
	});

	return (
		<div className="bg-black h-screen">
			<div className="absolute left-0 top-1/2 transform -translate-y-1/2 border-4 border-blue-500">
				<div className="border-4 border-blue-500">
					<div className="grid grid-cols-10 gap-0.5">
						{oppGrid.map((row, rowIndex) =>
							row.map((cell, colIndex) => (
								<div
									key={`opp-${rowIndex}-${colIndex}`}
									className={`w-2 h-2 sm:w-2 sm:h-2 md:w-4 md:h-4 lg:w-4 lg:h-4 lx:w-6 lx:h-6 border border-blue-700 ${cell ? 'bg-blue-500' : 'bg-blue-900'}`}
								></div>
							))
						)}
					</div>
				</div>
			</div>
			<div className="flex items-center justify-center h-screen">
				<div className="border-8 border-red-500">
					<div className="border-2 border-black">
						<div className="grid grid-cols-10 gap-0.5"
							tabIndex={0}
							onKeyDown={handleKeydown}
						>
							{grid.map((row, rowIndex) =>
								row.map((cell, colIndex) => (
									<div
										key={`${rowIndex}-${colIndex}`}
										className={`w-4 h-4 sm:w-4 sm:h-4 md:w-6 md:h-6 lg:w-6 lg:h-6 lx:w-8 lx:h-8 border border-red-700 ${cell ? 'bg-red-500' : 'bg-red-900'}`}
									></div>
								))
							)}
						</div>
						{countdown !== null && (
							<div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
								<h1 className="text-white text-6xl font-bold">
									{countdown}
								</h1>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default GamePage;