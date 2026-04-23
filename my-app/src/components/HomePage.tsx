import React, { ReactNode, Dispatch } from "react";
import { useSocket } from "../contexts/socketContext";
import "../index.css";
import ConnectPage from "./ConnectPage";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Popup from "./popupWindow";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

function HomePage() {
	const navigate = useNavigate();
	const socketContext = useSocket();
	const [name, setName] = useState<string>("");
	const [uuid, setUuid] = useState<string | undefined>(
		sessionStorage.getItem("uuid") == null
			? undefined
			: sessionStorage.getItem("uuid")?.toString()
	);
	const [roomId, setRoomId] = useState<string>("");
	const [listRoomsAc, setListRoomsAc] = useState([]);
	const [listRoomsCreate, setListRoomsCreate] = useState([]);
	const [listOtherRooms, setListOtherRooms] = useState([]);
	const [waitingList, setWaitingList] = useState<string[]>([]);

	const [listButtonClicked, setListButtonClicked] = useState<boolean>(false);
	const [listButtonClickedActive, setListButtonClickedActive] =
		useState<boolean>(false);
	const [listButtonClickedRooms, setListButtonClickedRooms] =
		useState<boolean>(false);
	const [listButtonClickedOthers, setListButtonClickedOthers] =
		useState<boolean>(false);

	const [showPopup, setShowPopup] = useState<boolean>(false);
	const [popupTitle, setPopupTitle] = useState<string>("");
	const [popupChild, setPopupChild] = useState<ReactNode>(<div></div>);
	const titleRoomCreated = "CONGRATS !";
	const notEnoughPerson = Toastify({
		text: "Not enough players to launch a game !",
		duration: 3000,
		close: true,
	});

	if (!socketContext) {
		throw new Error("ConnectPage must be used within a SocketProvider");
	}

	const { socket, setSocket } = socketContext;

	const togglePopup = () => {
		setShowPopup((prev) => {
			const newBoolean = !showPopup;
			if (prev === true) {
				setPopupTitle("");
				setPopupChild(<div></div>);
			}
			return newBoolean;
		});
	};

	// const handleLogout = () => {
	// 	sessionStorage.clear();
	// 	setUuid(undefined);
	// 	setName("");
	// };

	const handleJoinSolo = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		socket?.emit("startSingleTetrisGame", { name: name, uuid: uuid });
	};

	const handleJoinRoom = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		if (name) {
			navigate("/global-room/" + name);
		}
	};

	const handleCreateRoom = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		socket?.emit("createRoom", { name: name, uuid: uuid });
		const newTitle = titleRoomCreated;
		setPopupTitle(newTitle);
	};

	const childForMyRooms = (
		room: string,
		waitList: string[],
		setListButtonClickedSpec: React.Dispatch<React.SetStateAction<boolean>>
	): ReactNode => {
		const startMultiGame = (room: string) => {
			console.log("startMultiGame", { name: name, uuid: uuid, roomId: room });
			socket?.emit("startMultiGame", { name: name, uuid: uuid, roomId: room });
			const goToRoute = room + "/" + name;
			if (waitList.length > 1) {
				navigate(goToRoute, { state: { legacy: true } });
				setListButtonClickedSpec(false);
				setListButtonClicked(false);
			}
		};

		return (
			<div>
				<div className="flex flex-col my-1 space-y-5 p-10 ">
					<div className="bg-gray-900 border-4 border-gray-700 rounded-lg">
						<h1 className="text-white text-xl font-semibold text-center mt-4">
							WAITING LIST
						</h1>
						<div className="flex flex-col space-y-3 p-4 max-h-48 overflow-y-auto">
							{waitList?.map((player, index) => {
								return (
									<div
										key={index}
										className="text-white text-center truncate py-2 px-4 bg-gray-700 rounded-lg shadow-md"
									>
										{player}
									</div>
								);
							})}
						</div>
					</div>
					<button
						className="bg-[#00aa00] hover:bg-[#008800] active:bg-[#00aa00] text-white font-bold py-2 px-6 rounded-full transition-all duration-200 mb-4"
						onClick={() => startMultiGame(room)}
					>
						Launch a game
					</button>
				</div>
			</div>
		);
	};

	const childForOtherRooms = (
		room: string,
		setListButtonClickedSpec: React.Dispatch<React.SetStateAction<boolean>>,
		isStarted: boolean
	): ReactNode => {
		const joinGame = (room: string) => {
			console.log("joinGame : ", { name: name, uuid: uuid, roomId: room });
			socket?.emit("joinGame", { name: name, uuid: uuid, roomId: room });
			setListButtonClickedSpec(false);
			setListButtonClicked(false);
		};

		return (
			<div>
				<div className="flex flex-col space-y-5 p-5">
					{isStarted ? (
						<div className="text-white text-center">
							THIS GAME HAS ALREADY STARTED
						</div>
					) : null}
					<button
						className="bg-[#0055cc] hover:bg-[#0044aa] active:bg-[#0055cc] text-white truncate font-bold py-2 px-4 rounded-full transition-all duration-200"
						onClick={() => {
							joinGame(room);
						}}
					>
						{isStarted ? "Join waiting list" : "Join this game"}
					</button>
				</div>
			</div>
		);
	};

	const theRoomList = ({
		listRooms,
		setListButtonClickedSpec,
		title,
	}: {
		listRooms: never[];
		setListButtonClickedSpec: Dispatch<React.SetStateAction<boolean>>;
		title: string;
	}) => {
		if (uuid && name) {
			return (
				<div className="flex flex-col items-center justify-center min-h-screen pt-16">
					<div className="p-4 bg-gray-900 border-4 border-gray-700 rounded-full w-fit">
						<div className="text-white font-bold">{title}</div>
					</div>
					<div className="w-full max-w-4xl max-h-[720px] shadow-lg p-8 bg-gray-900 border-4 border-gray-700 rounded-lg m-4 overflow-auto">
						<div className="grid grid-cols-4 gap-4 auto-rows-fr">
							{title != "OTHERS ROOMLIST"
								? listRooms.map((room: string, index: number) => {
									return (
										<div
											key={index}
											className="flex bg-gray-700 hover:bg-gray-600 rounded-md transition-all duration-200 min-h-[48px]"
										>
											<button
												className="text-white truncate font-bold py-2 px-4 rounded-full w-full h-full flex items-center justify-center"
												onClick={(e) => {
													e.preventDefault();
													const newRoom = room;
													setRoomId(newRoom);
													if (title === "ACTIVE ROOMLIST") {
														const goToRoute = newRoom + "/" + name;
														navigate(goToRoute, { state: { legacy: true } });
														setListButtonClickedSpec(false);
														setListButtonClicked(false);
													} else {
														setPopupTitle(newRoom);
														socket?.emit("getWaitingList", {
															uuid: uuid,
															roomId: newRoom,
														});
													}
												}}
											>
												{room}
											</button>
										</div>
									);
								})
								: listRooms.map((array: any, index: number) => {
									return (
										<div
											key={index}
											className="flex bg-gray-700 hover:bg-gray-600 rounded-md transition-all duration-200 min-h-[48px]"
										>
											<button
												className="text-white truncate font-bold py-2 px-4 rounded-full w-full h-full flex items-center justify-center"
												onClick={(e) => {
													e.preventDefault();
													const newRoom = array.roomId;
													setRoomId(newRoom);
													setPopupTitle(newRoom);
													setPopupChild(
														childForOtherRooms(
															newRoom,
															setListButtonClickedSpec,
															array.isStarted
														)
													);
													togglePopup();
												}}
											>
												{array.roomId}
											</button>
										</div>
									);
								})}
						</div>
					</div>
					<div className="text-center">
						<button
							className="bg-[#ff0000] hover:bg-[#cc0000] active:bg-[#ff0000] text-white font-bold py-2 px-4 rounded-full w-fit transition-all duration-200"
							onClick={() => {
								setListButtonClickedSpec(false);
								setListButtonClicked(false);
							}}
						>
							Menu
						</button>
					</div>
				</div>
			);
		}
	};

	const displayAList = () => {
		if (listButtonClickedActive) {
			socket?.emit("getActiveRooms", { uuid: uuid });
			console.log("getActiveRooms 2");
			return theRoomList({
				listRooms: listRoomsAc,
				setListButtonClickedSpec: setListButtonClickedActive,
				title: "ACTIVE ROOMLIST",
			});
		} else if (listButtonClickedRooms) {
			socket?.emit("getCreateRooms", { uuid: uuid });
			return theRoomList({
				listRooms: listRoomsCreate,
				setListButtonClickedSpec: setListButtonClickedRooms,
				title: "MY ROOMLIST",
			});
		} else if (listButtonClickedOthers) {
			socket?.emit("getOtherRooms", { uuid: uuid });
			return theRoomList({
				listRooms: listOtherRooms,
				setListButtonClickedSpec: setListButtonClickedOthers,
				title: "OTHERS ROOMLIST",
			});
		}
	};

	useEffect(() => {
		socket?.on("pageToGo", (data) => {
			setRoomId(data.pageInfos.roomName);
			const goToRoute = data.pageInfos.path;
			navigate(goToRoute, { state: { legacy: true } });
		});
		return () => {
			socket?.off("pageToGo");
		};
	});

	useEffect(() => {
		console.log("useEffect setUuid");
		const newUuid = sessionStorage.getItem("uuid");
		const newName = sessionStorage.getItem("name");
		if (newUuid && newName) {
			console.log("useEffect setUuid inside if");
			setUuid(newUuid);
			setName(newName);
			if (socket === undefined && newUuid && newName) {
				console.log("useEffect setSocket");
				setSocket(
					io("http://localhost:3000", {
						query: { name: newName, uuid: newUuid },
					})
				);
			} else if (newUuid === undefined || newName === undefined) {
				console.log(`uuid or name is undefined ${newUuid} ${newName}`);
			}
		}
		console.log("useEffect setUuid end : ", { uuid: uuid, name: name });
	}, [uuid]);

	useEffect(() => {
		console.log("useEffect get rooms");
		if (uuid && socket) {
			socket.emit("getActiveRooms", { uuid: uuid });
			socket.emit("getCreateRooms", { uuid: uuid });
			socket.emit("getOtherRooms", { uuid: uuid });
		}
		socket?.on("getActiveRooms", (data) => {
			console.log("getActiveRooms 3");
			setListRoomsAc(data.activeRooms);
		});
		socket?.on("getCreateRooms", (data) => {
			setListRoomsCreate(data.createRooms);
		});
		socket?.on("getOtherRooms", (data) => {
			setListOtherRooms(data.otherRooms);
		});
		return () => {
			socket?.off("getActiveRooms");
			socket?.off("getCreateRooms");
			socket?.off("getOtherRooms");
		};
	}, [socket]);

	useEffect(() => {
		socket?.on("getCreateRooms", (data) => {
			console.log("getCreateRooms", { uuid: uuid });
			if (popupTitle === titleRoomCreated) {
				console.log(popupTitle);
				setPopupChild(
					<div className="text-white text-2xl font-bold text-center">
						{"A new room has been created : " +
							data.createRooms[data.createRooms.length - 1]}
					</div>
				);
				togglePopup();
				const newCreatedRoom = data.createRooms;
				setListRoomsCreate(newCreatedRoom);
			}
		});
		return () => {
			socket?.off("getCreateRooms");
		};
	}, [socket, popupTitle]);

	useEffect(() => {
		socket?.on("list_players_room", (data) => {
			console.log("list_players_room = " + data.players);
			setTimeout(() => {
				console.log(
					"sessionStorage.getItem('uuid') = " + sessionStorage.getItem("uuid")
				);
				console.log(
					"sessionStorage.getItem('name') = " + sessionStorage.getItem("name")
				);
				console.log({ uuid: uuid, roomId: data.roomId, name: name });
			}, 1000);
			const newWaitingList = data.players;
			setWaitingList(newWaitingList);
			setPopupChild(
				childForMyRooms(data.roomId, data.players, setListButtonClickedRooms)
			);
			togglePopup();
		});
		return () => {
			socket?.off("list_players_room");
		};
	}, [
		socket,
		waitingList,
		setWaitingList,
		setPopupChild,
		setListButtonClickedRooms,
		childForMyRooms,
		togglePopup,
	]);

	useEffect(() => {
		socket?.on("not_enough_person", (data) => {
			console.log(data.message);
			notEnoughPerson.showToast();
		});
		return () => {
			socket?.off("not_enough_person");
		};
	}, [socket]);

	return sessionStorage.getItem("name") ? (
		<div className="bg-[#1a1b26] min-h-screen">
			<header className="fixed top-0 left-0 right-0 bg-gray-900 flex flex-row w-full p-4 border-b-4 border-gray-700 z-10">
				<h2 className="text-white text-xl font-bold truncate">{name}</h2>
				{/* <button
						className="bg-[#7851a9] hover:bg-[#6d6d6d] active:bg-[#433a3f] text-white font-bold py-2 px-4 rounded-full transition-all duration-200"
						onClick={handleLogout}
					>
						Disconnect
				</button> */}
			</header>
			{Popup({
				show: showPopup,
				title: popupTitle,
				children: popupChild,
				onClose: togglePopup,
			})}
			{listButtonClicked ? (
				displayAList()
			) : (
				<div className="flex items-center justify-center min-h-screen pt-16">
					<div className="text-center">
						<h1 className="bg-gray-900 text-white font-bold text-3xl border-t-4 border-l-4 border-r-4 border-gray-700">
							RED TETRIS
						</h1>
						<div 
							className="relative border-4 border-gray-700 bg-gray-900 w-64 h-100 rounded-lg overflow-hidden"
							style={{
								backgroundImage: `
									linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
									linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
								`,
								backgroundSize: '12px 12px'
							}}
						>
							<div className="flex flex-col my-1 space-y-5 p-10">
								<button
									className="bg-[#daa32d] hover:bg-[#c99327] active:bg-[#daa32d] text-black font-bold py-2 px-4 rounded-full transition-all duration-200 relative overflow-hidden"
									style={{
										backgroundImage: `
											linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
											linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
										`,
										backgroundSize: '12px 12px'
									}}
									onClick={handleJoinRoom}
								>
									Play with Anyone
								</button>
								<button
									className="bg-[#00ff00] hover:bg-[#00cc00] active:bg-[#00ff00] text-black font-bold py-2 px-4 rounded-full transition-all duration-200 relative overflow-hidden"
									style={{
										backgroundImage: `
											linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px),
											linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px)
										`,
										backgroundSize: '12px 12px'
									}}
									onClick={handleJoinSolo}
								>
									Solo game
									<div className="flex items-center justify-center">
										<span aria-hidden="true" className="text-xl leading-none">
											👤
										</span>
									</div>
								</button>
								<button
									className="bg-[#0077ff] hover:bg-[#0055cc] active:bg-[#0077ff] text-white font-bold py-2 px-4 rounded-full transition-all duration-200 relative overflow-hidden"
									style={{
										backgroundImage: `
											linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
											linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
										`,
										backgroundSize: '12px 12px'
									}}
									onClick={handleCreateRoom}
								>
									Create a room
									<div className="flex items-center justify-center">
										<span aria-hidden="true" className="text-2xl leading-none">
											⊞
										</span>
									</div>
								</button>
								<button
									className="bg-[#ff7f00] hover:bg-[#cc6600] active:bg-[#ff7f00] text-black font-bold py-2 px-4 rounded transition-all duration-200 relative overflow-hidden"
									style={{
										backgroundImage: `
											linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px),
											linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px)
										`,
										backgroundSize: '12px 12px'
									}}
									onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
										e.preventDefault();
										setListButtonClickedRooms(true);
										setListButtonClicked(true);
									}}
								>
									ALL MY ROOMS
									<div className="flex items-center justify-center">
										<span aria-hidden="true" className="text-2xl leading-none">
											☰
										</span>
									</div>
								</button>
								<button
									className="bg-[#ffff00] hover:bg-[#cccc00] active:bg-[#ffff00] text-black font-bold py-2 px-4 rounded transition-all duration-200 relative overflow-hidden"
									style={{
										backgroundImage: `
											linear-gradient(rgba(0,0,0,0.15) 1.5px, transparent 1px),
											linear-gradient(90deg, rgba(0,0,0,0.15) 1.5px, transparent 1px)
										`,
										backgroundSize: '12px 12px'
									}}
									onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
										e.preventDefault();
										setListButtonClickedOthers(true);
										setListButtonClicked(true);
									}}
								>
									Join a game
									<div className="flex items-center justify-center">
										<span aria-hidden="true" className="text-2xl leading-none">
											👥
										</span>
									</div>
								</button>
								<button
									className="bg-[#800080] hover:bg-[#660066] active:bg-[#800080] text-white font-bold py-2 px-4 rounded transition-all duration-200 relative overflow-hidden"
									style={{
										backgroundImage: `
											linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
											linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
										`,
										backgroundSize: '12px 12px'
									}}
									onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
										e.preventDefault();
										console.log("getActiveRooms ----");
										setListButtonClickedActive(true);
										setListButtonClicked(true);
									}}
								>
									Go back to a game
									<div className="flex items-center justify-center">
										<span aria-hidden="true" className="text-2xl leading-none">
											↩
										</span>
									</div>
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	) : (
		ConnectPage({
			name: name,
			setName: setName,
			uuid: uuid,
			setUuid: setUuid,
			socket: socket,
			setSocket: setSocket,
		})
	);
}

export default HomePage;
