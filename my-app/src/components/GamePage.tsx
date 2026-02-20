import { useEffect, useState } from "react";
import { useSocket } from "../contexts/socketContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import React from "react";
import Toastify from 'toastify-js'
import "toastify-js/src/toastify.css"
import { io } from "socket.io-client";
import { cellColorMainGrid, displayTetromino, displaySpectrums } from "../functions/forTheGame";

interface RoomPlayer {
	name: string;
	uuid: string;
	isHost: boolean;
}

function GamePage() {

	const socketContext = useSocket();

	if (!socketContext) {
		throw new Error('ConnectPage must be used within a SocketProvider');
	}

	const { socket, setSocket } = socketContext;

	const navigate = useNavigate();
	const location = useLocation();
	const routeParam = useParams();

	// Legacy flows (solo, created rooms, old multi) skip the lobby entirely
	const isLegacyNav = !!(location.state as any)?.legacy;
	const [phase, setPhase] = useState<'lobby' | 'playing' | 'gameover'>(isLegacyNav ? 'playing' : 'lobby');
	const [players, setPlayers] = useState<RoomPlayer[]>([]);
	const [isHost, setIsHost] = useState<boolean>(false);
	const [partyDone, setPartyDone] = useState<boolean>(false);
	const [winner, setWinner] = useState<boolean>(false);
	const [multiGame, setMultiGame] = useState<boolean>(false);
	const [isWaiting, setWaiting] = useState<boolean>(true);

	// Derived game mode booleans
	const [isPlayWithAnyone, setIsPlayWithAnyone] = useState<boolean>(!isLegacyNav);
	const [isCustomRoom, setIsCustomRoom] = useState<boolean>(isLegacyNav && multiGame);
	const [isSolo, setIsSolo] = useState<boolean>(isLegacyNav && !multiGame);
	const [countdown, setCountdown] = useState<number | null>(null);
	const roomId = routeParam.room;
	const playerNameFromUrl = routeParam.player_name;
	// UUID: prefer sessionStorage, fallback will be set by new-person event
	const [uuid, setUuid] = useState<string | null>(sessionStorage.getItem("uuid"));


	const numRows = 20;
	const numCols = 10;
	const emptyGrid = Array.from({ length: numRows }, () => Array(numCols).fill(0));

	const [grid, setGrid] = useState<number[][]>(emptyGrid);
	const [tetrominos, setTetro] = useState();
	const [specList, setSpecList] = useState();

	const GameStartedToast = Toastify({
		text: "Game already in progress, cannot join",
		duration: 3000,
		close: true,
	});

	const NameTakenToast = Toastify({
		text: "This player name is already taken in this room",
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
		if (isLegacyNav) {
			// Only emit notRetryGame if the game is over, not during active play
			// (the old system just navigated away; the game loop handles its own cleanup)
			if (partyDone) {
				socket?.emit("notRetryGame", { uuid: uuid, roomId: roomId });
			}
		} else {
			socket?.emit("leaveRoom", { uuid: uuid, roomId: roomId });
		}
		setPartyDone(false);
		setPhase('lobby');
		navigate("/");
	}

	const goBackToLobby = () => {
		setPartyDone(false);
		setWinner(false);
		setGrid(emptyGrid);
		setPhase('lobby');
	}

	const retryGame = () => {
		if (isPlayWithAnyone) {
			goBackToLobby();
		} else if (isCustomRoom) {
			socket?.emit("retryGame", { uuid: uuid, roomId: roomId });
			setPartyDone(false);
			setWaiting(true);
		} else if (isSolo) {
			socket?.emit("startSingleTetrisGame", { name: name, uuid: uuid });
			setPartyDone(false);
			setWaiting(true);
		}
	}

	// ==================== SOCKET CONNECTION ====================

	useEffect(() => {
		if (socket === undefined) {
			const storedName = sessionStorage.getItem("name");
			const storedUuid = sessionStorage.getItem("uuid");
			// Use player name from URL, or fallback to sessionStorage
			const nameToUse = playerNameFromUrl || storedName || "Player";
			const newSocket = io("http://localhost:3000", {
				query: { name: nameToUse, uuid: storedUuid || undefined },
			});
			setSocket(newSocket);
		}
	}, []);

	// Handle new-person event (first connection, server assigns UUID)
	useEffect(() => {
		socket?.on("new-person", (data) => {
			sessionStorage.setItem("uuid", data.uuid);
			sessionStorage.setItem("name", data.name);
			setUuid(data.uuid);
		});
		return () => {
			socket?.off("new-person");
		};
	}, [socket]);

	// Join room once we have socket + uuid (only for new room-based flow, not legacy)
	useEffect(() => {
		if (!isLegacyNav && socket && uuid && roomId) {
			socket.emit("joinRoom", { uuid, roomId });
		}
	}, [socket, uuid, roomId]);

	// ==================== ROOM EVENTS ====================

	useEffect(() => {
		socket?.on("room_joined", (data) => {
			if (data.roomId === roomId) {
				setPhase('lobby');
			}
		});
		return () => {
			socket?.off("room_joined");
		};
	}, [socket, roomId]);

	useEffect(() => {
		socket?.on("room_join_failed", (data) => {
			if (data.roomId === roomId) {
				if (data.reason === 'game_started') {
					GameStartedToast.showToast();
				} else if (data.reason === 'name_taken') {
					NameTakenToast.showToast();
				}
				navigate("/");
			}
		});
		return () => {
			socket?.off("room_join_failed");
		};
	}, [socket, roomId]);

	useEffect(() => {
		socket?.on("room_players_update", (data) => {
			if (data.roomId === roomId) {
				setPlayers(data.players);
				setIsHost(data.hostUuid === uuid);
				// If game ended, go back to lobby
				if (!data.isStarted && phase === 'gameover') {
					goBackToLobby();
				}
			}
		});
		return () => {
			socket?.off("room_players_update");
		};
	}, [socket, roomId, uuid, phase]);

	useEffect(() => {
		socket?.on("room_host_changed", (data) => {
			if (data.roomId === roomId) {
				setIsHost(data.newHostUuid === uuid);
			}
		});
		return () => {
			socket?.off("room_host_changed");
		};
	}, [socket, roomId, uuid]);

	useEffect(() => {
		socket?.on("room_start_failed", (data) => {
			if (data.roomId === roomId) {
				Toastify({
					text: "Cannot start: " + (data.reason || "unknown error"),
					duration: 3000,
					close: true,
				}).showToast();
			}
		});
		return () => {
			socket?.off("room_start_failed");
		};
	}, [socket, roomId]);

	// ==================== GAME EVENTS ====================

	useEffect(() => {
		socket?.on("countdown", (data) => {
			if (data.roomId === roomId) {
				setPhase('playing');
				setWaiting(false);
				setCountdown(data.currentTime === 0 ? null : data.currentTime);
			}
		});
		return () => {
			socket?.off("countdown");
		}
	}, [socket, roomId]);

	useEffect(() => {
		socket?.on("beforeGame", (data) => {
			setPhase('playing');
			setWaiting(false);
			setGridWithRightSize(data.player.grid);
			setTetro(data.player.tetrominos);
			setIsPlayWithAnyone(!isLegacyNav);
			setMultiGame(data.player.type === 100 ? true : false);
			setIsCustomRoom(data.player.type === 100 && isLegacyNav);
			setIsSolo(data.player.type !== 100 && isLegacyNav);
		});
		return () => {
			socket?.off("beforeGame");
		}
	}, [socket]);

	useEffect(() => {
		socket?.on("myGame", (data) => {
			if (data.player.roomId === roomId) {
				setPhase('playing');
				setWaiting(false);
				setGridWithRightSize(data.player.grid);
				setTetro(data.player.tetrominos);
				setMultiGame(data.player.type === 100 ? true : false);
				setSpecList(data.listSpectrum);
			}
		});
		return () => {
			socket?.off("myGame");
		}
	}, [socket, roomId]);

	useEffect(() => {
		socket?.on("endGame", (data) => {
			if (data.player.roomId === roomId) {
				setWaiting(false);
				setMultiGame(data.player.type === 100 ? true : false);
				if (data.player.uuid === uuid) {
					setWinner(data.player.winner);
				}
				setGrid(emptyGrid);
				setPartyDone(true);
				setPhase('gameover');
			}
		});
		return () => {
			socket?.off("endGame");
		}
	}, [socket, roomId, uuid]);

	useEffect(() => {
		socket?.on("noGame", () => {
			NoGame.showToast();
			goBackToHome();
		});
		return () => {
			socket?.off("noGame");
		};
	}, [socket]);


	// ==================== LOBBY UI ====================

	const LobbyView = () => {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="flex flex-col items-center space-y-6 p-8 bg-gray-900 border-4 border-gray-700 rounded-lg min-w-[320px]">
					<h1 className="text-white text-3xl font-bold">RED TETRIS</h1>
					<div className="bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-2">
						<span className="text-gray-400 text-sm">Room:</span>
						<span className="text-white font-bold ml-2">{roomId}</span>
					</div>

					<div className="text-white text-lg">
						{players.length} player{players.length !== 1 ? 's' : ''} in room
					</div>

					<div className="w-full max-h-56 overflow-y-auto space-y-2">
						{players.map((p, i) => (
							<div
								key={i}
								className="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-2"
							>
								<span className="text-white font-medium truncate">{p.name}</span>
								{p.isHost && (
									<span className="text-yellow-400 text-xs font-bold bg-yellow-900 px-2 py-1 rounded">
										HOST
									</span>
								)}
							</div>
						))}
					</div>

					{isHost ? (
						<button
							className="bg-[#00ff00] hover:bg-[#00cc00] active:bg-[#00ff00] text-black font-bold py-3 px-8 rounded-full w-full transition-all duration-200"
							style={{
								backgroundImage: `
									linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px),
									linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px)
								`,
								backgroundSize: '12px 12px'
							}}
							onClick={() => socket?.emit('startRoom', { uuid: uuid, roomId: roomId })}
							disabled={players.length < 2}
						>
							Start Game
						</button>
					) : (
						<div className="flex items-center space-x-3 text-gray-400">
							<div className="w-4 h-4 border-2 border-t-2 border-gray-600 rounded-full animate-spin border-t-gray-300"></div>
							<span>Waiting for host to start...</span>
						</div>
					)}

					<button
						className="bg-[#ff0000] hover:bg-[#cc0000] active:bg-[#ff0000] text-white font-bold py-2 px-4 rounded-full w-full transition-all duration-200"
						style={{
							backgroundImage: `
								linear-gradient(rgba(255,255,255,0.15) 1.5px, transparent 1px),
								linear-gradient(90deg, rgba(255,255,255,0.15) 1.5px, transparent 1px)
							`,
							backgroundSize: '8px 8px'
						}}
						onClick={goBackToHome}
					>
						Leave Room
					</button>
				</div>
			</div>
		);
	};

	// ==================== RENDER ====================

	if (phase === 'lobby') {
		return (
			<div className="bg-[#1a1b26] h-screen">
				<LobbyView />
			</div>
		);
	}

	return (
		<div className="bg-[#1a1b26] h-screen">
			{isWaiting ? (
				<div data-testid="waiting-logo" className="flex items-center justify-center h-screen">
					<div className="flex flex-col items-center">
						<div className="text-red-600 text-center font-bold mb-4">
							PLEASE WAIT
						</div>
						<div className="w-16 h-16 border-4 border-t-4 border-red-200 rounded-full animate-spin border-t-red-500"></div>
						<button className="mt-6 bg-red-500 hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-6 rounded-full" onClick={goBackToHome}>Menu</button>
					</div>
				</div>
			) : (
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
										<div className="flex flex-col my-1 space-y-5 p-10 bg-gray-900 border-4 border-gray-700 rounded-lg">
											<h1 className="text-white text-5xl font-bold text-center">
												{winner ? "YOU WON" : "GAME OVER"}
											</h1>
											<h1 className="text-white text-3xl font-bold text-center">
												{isPlayWithAnyone ? "Back to lobby?" : "Retry?"}
											</h1>
											<div className="flex flex-row justify-center items-center space-x-5">
												<button
													className="bg-[#00ff00] hover:bg-[#00cc00] active:bg-[#00ff00] text-white font-bold py-2 px-4 rounded-full w-fit transition-all duration-200 relative overflow-hidden"
													style={{
														backgroundImage: `
															linear-gradient(rgba(255,255,255,0.15) 1.5px, transparent 1px),
															linear-gradient(90deg, rgba(255,255,255,0.15) 1.5px, transparent 1px)
														`,
														backgroundSize: '8px 8px'
													}}
													onClick={retryGame}
												>
													{isPlayWithAnyone ? "LOBBY" : "RETRY"}
												</button>
												<button
													className="bg-[#ff0000] hover:bg-[#cc0000] active:bg-[#ff0000] text-white font-bold py-2 px-4 rounded-full w-fit transition-all duration-200 relative overflow-hidden"
													style={{
														backgroundImage: `
															linear-gradient(rgba(255,255,255,0.15) 1.5px, transparent 1px),
															linear-gradient(90deg, rgba(255,255,255,0.15) 1.5px, transparent 1px)
														`,
														backgroundSize: '8px 8px'
													}}
													onClick={goBackToHome}
												>
													MENU
												</button>
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
			)}
		</div>
	);
}

export default GamePage;
