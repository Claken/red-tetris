import { useEffect, useState } from "react";
import { useSocket } from "../contexts/socketContext";
import { useNavigate, useParams } from "react-router-dom";
import React from "react";

function GamePage() {

	const socketContext = useSocket();

	if (!socketContext) {
		throw new Error('ConnectPage must be used within a SocketProvider');
	}

	const { socket } = socketContext;
	const uuid = sessionStorage.getItem("uuid");
	const name = sessionStorage.getItem("name");
	const [partyDone, setPartyDone] = useState<boolean>(false);
	const [winner, setWinner] = useState<boolean>(false);
	const [multiGame, setMultiGame] = useState<boolean>(false);
	const [isWaiting, setWaiting] = useState<boolean>(true);
	const [countdown, setCountdown] = useState<number | null>(null);
	const navigate = useNavigate();
	const routeParam = useParams();
	const roomId = routeParam.room;

	const numRows = 20;
	const numCols = 10;
	const emptyGrid = Array.from({ length: numRows }, () => Array(numCols).fill(0));

	const [grid, setGrid] = useState<number[][]>(emptyGrid);
	const [tetrominos, setTetro] = useState();
	const [specList, setSpecList] = useState<Array>();

	const handleKeydown = (e: React.KeyboardEvent<HTMLDivElement>) => {
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

	const setGridWithRightSize = (grid: number[][]) => {
		const newGrid = grid.slice(4, 24);
		setGrid(newGrid);
	}

	const goBackToHome = () => {
		setPartyDone(false);
		navigate("/");
	}

	const retryGame = () => {
		setPartyDone(false);
		if (multiGame) {
			socket?.emit("retryGame", { uuid: uuid, roomId: roomId });
		}
		else {
			socket?.emit("startSingleTetrisGame", { name: name, uuid: uuid });
			setWaiting(true);
		}
	}

	const cellColorMainGrid = (cell: number) => {
		switch (cell) {
			case (1): // turquoise
				return 'bg-[#00ffff]'
			case (2):
				return 'bg-[#0077ff]'
			case (3):
				return 'bg-[#ff7f00]'
			case (4):
				return 'bg-[#ffff00]'
			case (5):
				return 'bg-[#00ff00]'
			case (6):
				return 'bg-[#800080]'
			case (7):
				return 'bg-[#ff0000]'
			case (0): 	// grid's cell
				return 'bg-[#1a1b26]'
			case (102): // tetromino's shadown
				return 'bg-[#7d0202] opacity-75'
			case (20): // indestructible line
				return 'bg-gray-500'
		}
		return 'bg-red-400'
	}

	const getTetroColor = (type: string) => {
		switch (type) {
			case ('I'):
				return 'bg-[#00ffff]'
			case ('J'):
				return 'bg-[#0077ff]'
			case ('L'):
				return 'bg-[#ff7f00]'
			case ('O'):
				return 'bg-[#ffff00]'
			case ('S'):
				return 'bg-[#00ff00]'
			case ('T'):
				return 'bg-[#800080]'
			case ('Z'):
				return 'bg-[#ff0000]'
		}
	}

	const displayTetromino = (tetromino: any) => {
		const tetroColor = getTetroColor(tetromino.type);
		return tetromino.shape.map((row: number[], rowIndex: number) => (
			<div key={rowIndex} className="flex">
				{row.map((cell: number, colIndex: number) => (
					<div
						key={colIndex}
						className={`w-4 h-4 ${cell !== 0 ? tetroColor : 'bg-transparent'}`}
					>
					</div>
				))}
			</div>
		));
	};

	const WaitingLogo = () => {
		return <div className="flex items-center justify-center h-screen">
			<div className="flex flex-col items-center">
				<div className="text-red-600 text-center font-bold mb-4">
					PLEASE WAIT
				</div>
				<div className="w-16 h-16 border-4 border-t-4 border-red-200 rounded-full animate-spin border-t-red-500"></div>
			</div>
		</div>
	}

	useEffect(() => {
		socket?.on("countdown", (data) => {
			if (data.roomId === roomId) {
				setCountdown(data.currentTime === 0 ? null : data.currentTime);
			}
		});
		return () => {
			socket?.off("countdown");
		}
	}, [socket]);

	useEffect(() => {
		socket?.on("beforeGame", (data) => {
			setWaiting(false);
			setGridWithRightSize(data.player.grid);
			setTetro(data.player.tetrominos);
			setMultiGame(data.player.type === 100 ? true : false);
		});
		return () => {
			socket?.off("beforeGame");
		}
	}, [socket]);

	useEffect(() => {
		socket?.on("myGame", (data) => {
			if (data.player.roomId === roomId) {
				setGridWithRightSize(data.player.grid);
				setTetro(data.player.tetrominos);
				if (isWaiting === true) setWaiting(false);
				setMultiGame(data.player.type === 100 ? true : false);
				// if (multiGame === true) {
					const caca = data.listSpectrum;
					setSpecList(caca);
					console.log(data.listSpectrum);
					console.log(specList);
				// }
			}
		});
		return () => {
			socket?.off("myGame");
		}
	}, [socket]);

	useEffect(() => {
		socket?.on("endGame", (data) => {
			if (data.player.uuid === uuid) {
				setWinner(data.player.winner);
			}
			setGrid(emptyGrid);
			setPartyDone(true);
		});
		return () => {
			socket?.off("endGame");
		}
	}, [socket]);

	return (
		<div className="bg-[#1a1b26] h-screen">
			{isWaiting ? WaitingLogo() :
				<div className="flex items-center justify-center h-screen">
					<div className="mr-4">
						<div className="p-8 bg-gray-900 border-4 border-gray-700 rounded-lg">
							<div className="flex flex-col items-center space-y-4">
								<div className="text-center">
									<button className="bg-red-500 hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full w-fit" onClick={goBackToHome}>Menu</button>
								</div>

							</div>
						</div>
					</div>
					<div className="border-8 border-[#414868]">
						<div className="border-2 border-black">
							<div className="grid grid-cols-10 gap-0.5"
								tabIndex={0}
								onKeyDown={handleKeydown}
							>
								{grid.map((row, rowIndex) =>
									row.map((cell, colIndex) => (
										<div
											key={`${rowIndex}-${colIndex}`}
											className={`w-4 h-4 sm:w-4 sm:h-4 md:w-6 md:h-6 lg:w-6 lg:h-6 lx:w-8 lx:h-8 border border-[#414868] ${cellColorMainGrid(cell)}`}
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
							{partyDone === true && (
								<div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
									<div className="flex flex-col my-1 space-y-5 p-10">
										<h1 className="text-white text-5xl font-bold">
											{winner ? "YOU WON" : "GAME OVER"}
										</h1>
										<div className="text-center">
											<button className="bg-red-500 hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full w-fit" onClick={goBackToHome}>Menu</button>
										</div>
										<div className="text-center">
											<button className="bg-red-500 hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full w-fit" onClick={retryGame}>Retry</button>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
					<div className="ml-4">
						<div className="p-8 bg-gray-900 border-4 border-gray-700 rounded-lg">
							<div className="flex flex-col items-center space-y-4">
								<div className="text-white font-bold">
									NEXT :
								</div>
								{tetrominos && tetrominos.length > 0 && tetrominos.map((tetro, index) => (
									<div key={index} className="mb-4 items-center">
										{displayTetromino(tetro)}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			}
		</div>
	);
}

export default GamePage;