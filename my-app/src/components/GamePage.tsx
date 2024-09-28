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
	const numRows = 20;
	const numCols = 10;

	const [grid, setGrid] = useState<number[][]>(Array.from({ length: numRows }, () =>
		Array(numCols).fill(0)
	));
	const [oppGrid, setOppGrid] = useState<number[][]>(Array.from({ length: numRows }, () =>
		Array(numCols).fill(0)
	));

	const handleKeydown = (e: React.KeyboardEvent) => {
		console.log(e.key);
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
		console.log(data);
		// A FAIRE
	});

	socket?.on("beforeGame", (data) => {
		setGrid(data.player1.uuid === uuid ? data.player1.grid : data.player2.grid);
		setOppGrid(data.player1.uuid === uuid ? data.player2.grid : data.player1.grid);
		setRoomId(data.player1.roomId);
	});

	socket?.on("game", (data) => {
		console.log(data);
		setGrid(data.player1.uuid === uuid ? data.player1.grid : data.player2.grid);
		setOppGrid(data.player1.uuid === uuid ? data.player2.grid : data.player1.grid);
	});

	return (
		<div className="bg-black h-screen">
			<div className="flex items-center justify-center h-screen">\
				<div className="border-8 border-red-500">
					<div className="border-2 border-black">
						<div className="grid grid-cols-10 gap-0.5">
							{grid.map((row, rowIndex) =>
								row.map((cell, colIndex) => (
									<div
										key={`${rowIndex}-${colIndex}`}
										className={`w-4 h-4 sm:w-4 sm:h-4 md:w-6 md:h-6 lg:w-6 lg:h-6 lx:w-8 lx:h-8 border border-red-700 ${cell ? 'bg-red-500' : 'bg-red-900'}`}
									></div>
								))
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default GamePage;