import { useEffect, useState } from "react";
import { useSocket } from "../contexts/socketContext";
import { useNavigate } from "react-router-dom";

function GamePage() {

	const socketContext = useSocket();

	if (!socketContext) {
		throw new Error('ConnectPage must be used within a SocketProvider');
	}

	const { socket } = socketContext;
	const uuid = sessionStorage.getItem("uuid");
	const [roomId, setRoomId] = useState<string>("");
	const [countdown, setCountdown] = useState<number | null>(null);
	const navigate = useNavigate();

	// const [oppName, setOppName] = useState<string>("");
	// const [soloGame, setSoloGame] = useState<boolean>(false);
	const numRows = 20;
	const numCols = 10;
	const emptyGrid = Array.from({ length: numRows }, () => Array(numCols).fill(0));

	const [grid, setGrid] = useState<number[][]>(emptyGrid);
	// const [oppGrid, setOppGrid] = useState<number[][]>(emptyGrid);
	const [tetrominos, setTetro] = useState();

	const handleKeydown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		console.log(e.key);
		console.log(uuid)
		console.log(roomId)
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

	const cellColorMainGrid = (cell: number) => {
		if (cell === 1 || cell === 2) {
			return 'bg-red-500';
		}
		else if (cell === 102) {
			return 'bg-red-700'
		}
		return 'bg-red-900';
	}

	// const cellColorOppGrid = (cell: number) => {
	// 	if (cell === 1 || cell === 2) {
	// 		return 'bg-blue-500';
	// 	}
	// 	else if (cell === 102) {
	// 		return 'bg-blue-700'
	// 	}
	// 	return 'bg-blue-900';
	// }

	const goBackToHome = () => {
		navigate("/");
	}

	const displayTetromino = (tetromino: any) => {
		return tetromino.shape.map((row: number[], rowIndex: number) => (
			<div key={rowIndex} className="flex">
				{row.map((cell: number, colIndex: number) => (
					<div
						key={colIndex}
						className={`w-4 h-4 border ${cell === 1 ? 'bg-yellow-500' : 'bg-transparent'}`}
					></div>
				))}
			</div>
		));
	};

	useEffect(() => {
		socket?.on("countdown", (data) => {
			setCountdown(data.currentTime === 1 ? null : data.currentTime);
		});
		return () => {
			socket?.off("countdown");
		}
	}, [socket]);

	useEffect(() => {
		socket?.on("beforeGame", (data) => {
			// setGrid(data.player1.uuid === uuid ? data.player1.grid : data.player2.grid);
			// setOppGrid(data.player1.uuid === uuid ? data.player2.grid : data.player1.grid);
			// setOppName(data.player1.uuid === uuid ? data.player2.name : data.player1.name);
			// setRoomId(data.player1.roomId);
			// setTetro(data.player1.uuid === uuid ? data.player1.tetrominos : data.player2.tetrominos);
			setGrid(data.player.grid);
			setRoomId(data.player.roomId);
			setTetro(data.player.tetrominos);
		});
		return () => {
			socket?.off("beforeGame");
		}
	}, [socket]);

	useEffect(() => {
		socket?.on("myGame", (data) => {
			// setGrid(data.player1.uuid === uuid ? data.player1.grid : data.player2.grid);
			// setOppGrid(data.player1.uuid === uuid ? data.player2.grid : data.player1.grid);
			// setTetro(data.player1.uuid === uuid ? data.player1.tetrominos : data.player2.tetrominos);
			setGrid(data.player.grid);
			setRoomId(data.player.roomId);
			setTetro(data.player.tetrominos);
		});
		return () => {
			socket?.off("myGame");
		}
	}, [socket]);

	useEffect(() => {
		socket?.on("endGame", (data) => {
			setGrid(emptyGrid);
			console.log(data);
			// setOppGrid(emptyGrid);
		});
		return () => {
			socket?.off("endGame");
		}
	}, [socket]);

	return (
		<div className="bg-black h-screen">
			{/* <div className="absolute top-1/2 transform -translate-y-1/2">
				<div className="text-red-500 text-center">
					{oppName === "" ? "player2" : oppName}'s grid
				</div>
				<div className="border-4 border-blue-500">
					<div className="grid grid-cols-10 gap-0.5">
						{oppGrid.map((row, rowIndex) =>
							row.map((cell, colIndex) => (
								<div
									key={`opp-${rowIndex}-${colIndex}`}
									className={`w-2 h-2 sm:w-2 sm:h-2 md:w-4 md:h-4 lg:w-4 lg:h-4 lx:w-6 lx:h-6 border border-blue-700 ${cellColorOppGrid(cell)}`}
								></div>
							))
						)}
					</div>
				</div>
			</div> */}
			<div className="absolute top-1/2 right-5 transform -translate-y-1/2">
				<div className="text-red-500">
					TETROMINOS :
				</div>
				{tetrominos && tetrominos.length > 0 && tetrominos.map((tetro, index) => (
					<div key={index} className="mb-4 items-center">
						{displayTetromino(tetro)}
					</div>
				))}
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
										className={`w-4 h-4 sm:w-4 sm:h-4 md:w-6 md:h-6 lg:w-6 lg:h-6 lx:w-8 lx:h-8 border border-red-700 ${cellColorMainGrid(cell)}`}
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