import React, { ReactNode } from "react";
import { useSocket } from "../contexts/socketContext";
import "../index.css"
import ConnectPage from './ConnectPage';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from 'socket.io-client'
import roomList from "./roomList";
import Popup from "./popupWIndow";

function HomePage() {

	const navigate = useNavigate();
	const socketContext = useSocket();
	const [name, setName] = useState<string>("");
	const [uuid, setUuid] = useState<string | undefined>(undefined);
	const [roomId, setRoomId] = useState<string>("");
	const [listRoomsAc, setListRoomsAc] = useState([]);
	const [listRoomsCreate, setListRoomsCreate] = useState([]);
	const [listOtherRooms, setListOtherRooms] = useState([]);
	const [waitingList, setWaitingList] = useState<string[]>([]);

	const [listButtonClicked, setListButtonClicked] = useState<boolean>(false);
	const [listButtonClickedActive, setListButtonClickedActive] = useState<boolean>(false);
	const [listButtonClickedRooms, setListButtonClickedRooms] = useState<boolean>(false);
	const [listButtonClickedOthers, setListButtonClickedOthers] = useState<boolean>(false);

	const [showPopup, setShowPopup] = useState<boolean>(false);
	const [popupTitle, setPopupTitle] = useState<string>("");
	const [popupChild, setPopupChild] = useState<ReactNode>(<div></div>);
	const titleRoomCreated = "CONGRATS !";

	if (!socketContext) {
		throw new Error('ConnectPage must be used within a SocketProvider');
	}

	const { socket, setSocket } = socketContext;

	const togglePopup = () => {
		setShowPopup(!showPopup);
	};

	const handleJoinSolo = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		socket?.emit("startSingleTetrisGame", { name: name, uuid: uuid });
	}

	const handleCreateRoom = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		socket?.emit("createRoom", { name: name, uuid: uuid });
		const newTitle = titleRoomCreated;
		setPopupTitle(newTitle);
	}

	const startMultiGame = (room: string) => {
		socket?.emit("startMultiGame", { name: name, uuid: uuid, roomId: room });
		console.log(room);
		const goToRoute = room + '/' + name;
		navigate(goToRoute);
		setListButtonClickedRooms(false);
		setListButtonClicked(false);
	};

	const childForMyRooms = (room: string, waitList: string[]): ReactNode => {
		return (
			<div>
				<div className="flex flex-col my-1 space-y-5 p-10 ">
					<div className="bg-gray-700 rounded-lg">
						<h1 className="text-white text-xl font-semibold text-center mt-4">WAITING LIST</h1>
						<div className="flex flex-col space-y-3 p-4 max-h-48 overflow-y-auto">
							{waitList.length > 0 && waitList.map((player, index) => {
								return (
									<div key={index} className="text-white text-center py-2 px-4 bg-gray-600 rounded-lg shadow-md">
										{player}
									</div>
								);
							})}
						</div>
					</div>
					<button className="bg-[#508fe0] hover:bg-[#00916E] active:bg-[#007b5f] text-white font-bold py-2 px-6 rounded-full transition-all duration-200 mb-4"
						onClick={() => startMultiGame(room)}>
						Launch a game
					</button>

				</div>
			</div>
		);
	}

	const displayAList = () => {
		if (listButtonClickedActive) {
			socket?.emit("getActiveRooms", { uuid: uuid });
			return roomList(
				{
					setRoomId: setRoomId,
					name: name,
					uuid: uuid,
					listRooms: listRoomsAc,
					setListButtonClicked: setListButtonClicked,
					navigate: navigate,
					setListButtonClickedSpec: setListButtonClickedActive,
					title: "ACTIVE ROOMLIST",
					togglePopup: togglePopup,
					socket: socket
				}
			)
		}
		else if (listButtonClickedRooms) {
			return roomList(
				{
					setRoomId: setRoomId,
					name: name,
					uuid: uuid,
					listRooms: listRoomsCreate,
					setListButtonClicked: setListButtonClicked,
					navigate: navigate,
					setListButtonClickedSpec: setListButtonClickedRooms,
					title: "MY ROOMLIST",
					togglePopup: togglePopup,
					setPopupTitle: setPopupTitle,
					setPopupChild: setPopupChild,
					childForMyRooms: childForMyRooms,
					waitingList: waitingList,
					socket: socket
				}
			)
		}
		else if (listButtonClickedOthers) {

			socket?.emit("getOtherRooms", { uuid: uuid });
			return roomList(
				{
					setRoomId: setRoomId,
					name: name,
					uuid: uuid,
					listRooms: listOtherRooms,
					setListButtonClicked: setListButtonClicked,
					navigate: navigate,
					setListButtonClickedSpec: setListButtonClickedOthers,
					title: "OTHERS ROOMLIST",
					togglePopup: togglePopup,
					setPopupTitle: setPopupTitle,
					setPopupChild: setPopupChild,
					socket: socket
				}
			)
		}
	}

	useEffect(() => {
		socket?.on("pageToGo", (data) => {
			setRoomId(data.pageInfos.roomName);
			const goToRoute = data.pageInfos.path;
			navigate(goToRoute);
		});
		return () => {
			socket?.off("pageToGo");
		};
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

	useEffect(() => {
		if (uuid && socket) {
			socket.emit("getActiveRooms", { uuid: uuid });
			socket.emit("getCreateRooms", { uuid: uuid });
			socket.emit("getOtherRooms", { uuid: uuid });
		}
		socket?.on("getActiveRooms", (data) => {
			setListRoomsAc(data.activeRooms);
		});
		socket?.on("getCreateRooms", (data) => {
			setListRoomsCreate(data.createRooms);
		});
		socket?.on("getOtherRooms", (data) => {
			setListOtherRooms(data.otherRooms);
		});
	}, [socket]);

	useEffect(() => {
		socket?.on("getCreateRooms", (data) => {
			console.log("getCreateRooms")
			if (popupTitle === titleRoomCreated) {
				console.log(popupTitle);
				setPopupChild(<div className="text-white">
					{"a new room has been created : " + data.createRooms[data.createRooms.length - 1]}
				</div>);
				togglePopup();
				setListRoomsCreate(data.createRooms);
			}
		});
		return () => {
			socket?.off("getCreateRooms");
		};
	}, [socket, popupTitle]);

	useEffect(() => {
		socket?.on("list_players_room", (data) => {
			const newWaitingList = data.players;
			setWaitingList(newWaitingList);
			setPopupChild(childForMyRooms(roomId, newWaitingList));
		});
		return () => {
			socket?.off("list_players_room");
		};
	}, [socket]);

	return (
		sessionStorage.getItem("name") ?
			<div className="bg-black h-screen">
				{Popup(
					{
						show: showPopup,
						title: popupTitle,
						children: popupChild,
						onClose: togglePopup
					}
				)}
				{listButtonClicked ?
					displayAList() :
					<div className="flex items-center justify-center h-screen">
						<div className="text-center">
							<h1 className="bg-[#ff0000] text-white font-bold text-3xl border-t-2 border-l-2 border-r-2 border-white">RED TETRIS</h1>
							<div className="relative border-2 border-white bg-[#ff0000] w-64 h-100">
								<div className="flex flex-col my-1 space-y-5 p-10">
									<button className="bg-[#508fe0] hover:bg-[#00916E] active:bg-bg-[#00916E] text-white font-bold py-2 px-4 rounded-full transition-all duration-200"
										onClick={handleJoinSolo}>
										Solo game
										<div className="flex items-center justify-center">
											<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="" strokeWidth={1.5} stroke="currentColor" className="size-6">
												<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
											</svg>
										</div>
									</button>
									<button className="bg-[#b5651d] hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full transition-all duration-200"
										onClick={handleCreateRoom}>
										Create a room
										<div className="flex items-center justify-center">
											<svg className="h-8 w-8" fill="white" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
											</svg>
										</div>
									</button>
									<button className="bg-[#6d6d6d] hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full transition-all duration-200" onClick={
										() => {
											setListButtonClickedRooms(true);
											setListButtonClicked(true);
										}
									}>
										ALL MY ROOMS
										<div className="flex items-center justify-center">
											<svg className="h-8 w-8" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">  <line x1="8" y1="6" x2="21" y2="6" />  <line x1="8" y1="12" x2="21" y2="12" />  <line x1="8" y1="18" x2="21" y2="18" />  <line x1="3" y1="6" x2="3.01" y2="6" />  <line x1="3" y1="12" x2="3.01" y2="12" />  <line x1="3" y1="18" x2="3.01" y2="18" />
											</svg>
										</div>
									</button>
									<button className="bg-[#7851a9] hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full transition-all duration-200" onClick={
										() => {
											setListButtonClickedOthers(true);
											setListButtonClicked(true)
										}
									}>
										Join a game
										<div className="flex items-center justify-center">
											<svg className="h-8 w-8" fill="white" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
											</svg>
										</div>
									</button>
									<button className="bg-[#3a7a45] hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full transition-all duration-200" onClick={
										() => {
											setListButtonClickedActive(true);
											setListButtonClicked(true);
										}
									}>
										Go back to a game
										<div className="flex items-center justify-center">
											<svg className="h-8 w-8" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M9 11l-4 4l4 4m-4 -4h11a4 4 0 0 0 0 -8h-1" /></svg>
										</div>
									</button>
								</div>
							</div>
						</div>
					</div>}
			</div>
			: ConnectPage({ name: name, setName: setName, uuid: uuid, setUuid: setUuid, socket: socket, setSocket: setSocket })
	);
}

export default HomePage;
