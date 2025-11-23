import { useEffect, useState } from "react";
import { useSocket } from "../contexts/socketContext";
import { useNavigate, useParams } from "react-router-dom";
import React from "react";
import Toastify from 'toastify-js'
import "toastify-js/src/toastify.css"
import { io } from "socket.io-client";
import { cellColorMainGrid, displayTetromino, displaySpectrums } from "../functions/forTheGame";

function GamePage() {

	const socketContext = useSocket();

	if (!socketContext) {
		throw new Error('ConnectPage must be used within a SocketProvider');
	}

	const { socket, setSocket } = socketContext;

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
	const [specList, setSpecList] = useState();

	const CannotRestart = Toastify({
		text: "Cannot restart the game : not enough players",
		duration: 3000,
		close: true,
	});

	const NoGame = Toastify({
		text: "No game found",
		duration: 3000,
		close: true,
	});

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

	const notRetryingGame = () => {
		if (multiGame) {
			socket?.emit("notRetryGame", { uuid: uuid, roomId: roomId });
		}
		goBackToHome();
	}

	const retryGame = () => {
		if (multiGame) {
			socket?.emit("retryGame", { uuid: uuid, roomId: roomId });
		}
		else {
			socket?.emit("startSingleTetrisGame", { name: name, uuid: uuid });
		}
		setPartyDone(false);
		setWaiting(true);
	}

	const WaitingLogo = () => {
		return <div data-testid="waiting-logo" className="flex items-center justify-center h-screen">
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
				setWaiting(false);
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
				setWaiting(false);
				setGridWithRightSize(data.player.grid);
				setTetro(data.player.tetrominos);
				setMultiGame(data.player.type === 100 ? true : false);
				const caca = data.listSpectrum;
				setSpecList(caca);
				console.log(caca);
				console.log(specList);
			}
		});
		return () => {
			socket?.off("myGame");
		}
	}, [socket]);

	useEffect(() => {
		socket?.on("endGame", (data) => {
			if (data.player.roomId === roomId) {
			setWaiting(false);
			console.log({"data.player": data.player});
			setMultiGame(data.player.type === 100 ? true : false);
			if (data.player.uuid === uuid) {
				setWinner(data.player.winner);
			}
			setGrid(emptyGrid);
			setPartyDone(true);
		}
		});
		return () => {
			socket?.off("endGame");
		}
	}, [socket]);

	useEffect(() => {
		socket?.on("not_enough_person", () => {
			CannotRestart.showToast();
			goBackToHome();
		});
		return () => {
			socket?.off("not_enough_person");
		};
	}, [socket]);

	useEffect(() => {
		socket?.on("noGame", () => {
			goBackToHome();
		});
		return () => {
			socket?.off("noGame");
		};
	}, [socket]);

	useEffect(() => {
		if (socket === undefined) {
			console.log("socket is undefined");
			const newSocket = io("http://localhost:3000", {
				query: { name: name, uuid: uuid },
			});
			setSocket(newSocket);
		}
		socket?.emit("checkGame", { uuid: uuid, roomId: roomId });
	}, [socket]);

	useEffect(() => {
		socket?.on("noGame", () => {
			NoGame.showToast();
			goBackToHome();
		});
		return () => {
			socket?.off("noGame");
		};
	}, [socket]);

	return (
		<div className="bg-[#1a1b26] h-screen">
			{isWaiting ? WaitingLogo() :
				<div className="relative w-full h-full">
					{multiGame && specList && specList.length > 0 && <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
						<div className="text-white font-bold text-center text-xs sm:text-sm md:text-base mb-1">
							OPPONENTS
						</div>
						<div className="p-2 sm:p-3 md:p-4 bg-gray-900 border-2 sm:border-4 border-gray-700 rounded-lg max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-6rem)] md:max-h-[720px] overflow-auto">
							<div className="flex flex-col items-center space-y-2 sm:space-y-3 md:space-y-4">
								{displaySpectrums(specList, true)}
							</div>
						</div>
					</div>}
					{multiGame && specList && specList.length > 6 && <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
						<div className="text-white font-bold text-center text-xs sm:text-sm md:text-base mb-1">
							OPPONENTS
						</div>
						<div className="p-2 sm:p-3 md:p-4 bg-gray-900 border-2 sm:border-4 border-gray-700 rounded-lg max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-6rem)] md:max-h-[720px] overflow-auto">
							<div className="flex flex-col items-center space-y-2 sm:space-y-3 md:space-y-4">
								{displaySpectrums(specList, false)}
							</div>
						</div>
					</div>}
					<div className="flex items-center justify-center h-screen px-2 sm:px-4 md:px-0">
						<div className="mr-4">
							<div className="p-4 bg-gray-900 border-4 border-gray-700 rounded-lg">
								<div className="flex flex-col items-center space-y-4">
									<button className="bg-red-500 hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full w-fit" onClick={goBackToHome}>Menu</button>
								</div>
							</div>
						</div>
						<div className="border-8 border-[#414868]">
							<div className="border-2 border-black">
								<div className="grid grid-cols-10 gap-0.5"
									 tabIndex={0}
									 onKeyDown={handleKeydown}
									 data-testid="grid-container"
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
										<div className="relative flex items-center justify-center">
											<div className="absolute w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 border-4 border-gray-600 rounded-full"></div>
											<div className="absolute w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 border-4 border-t-4 border-transparent border-t-white rounded-full animate-spin"></div>
											<h1 className="text-white text-6xl sm:text-7xl md:text-8xl font-bold relative z-10">
												{countdown}
											</h1>
										</div>
									</div>
								)}
								{partyDone === true && (
									<div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
										<div className="flex flex-col my-1 space-y-5 p-10 bg-black bg-opacity-80 rounded-xl">
											<h1 className="text-white text-5xl font-bold">
												{winner ? "YOU WON" : "GAME OVER"}
											</h1>
											<h1 className="text-white text-3xl font-bold text-center">
												{" " + "Retry ?"}
											</h1>
											<div className="flex flex-row justify-center items-center space-x-5">
												<button className="bg-green-500 hover:bg-green-700 active:bg-green-500 text-white font-bold py-2 px-4 rounded-full w-fit" onClick={retryGame}>YES</button>
												<button className="bg-red-500 hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full w-fit" onClick={notRetryingGame}>NO</button>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
						<div className="ml-4">
							<div className="text-white font-bold text-center">
								NEXT
							</div>
							<div className="p-8 bg-gray-900 border-4 border-gray-700 rounded-lg w-32 h-[420px] overflow-auto">
								<div className="flex flex-col items-center space-y-4">
									{tetrominos && tetrominos.length > 0 && tetrominos.map((tetro: any, index: number) => (
										<div key={index} className="items-center">
											{displayTetromino(tetro)}
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			}
		</div>
	);
}

export default GamePage;