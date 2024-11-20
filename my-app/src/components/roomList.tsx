import React, { ReactNode } from "react";
import { Dispatch } from "react";
import { NavigateFunction } from "react-router-dom";
import { Socket } from "socket.io-client";

function roomList({
	setRoomId,
	uuid,
	name,
	listRooms,
	setListButtonClicked,
	navigate,
	setListButtonClickedSpec,
	title,
	togglePopup,
	setPopupTitle = undefined,
	setPopupChild = undefined,
	waitingList = undefined,
	socket,
}: {
	setRoomId: Dispatch<React.SetStateAction<string>>,
	name: string,
	uuid: string | undefined,
	listRooms: never[],
	setListButtonClicked: Dispatch<React.SetStateAction<boolean>>,
	setListButtonClickedSpec: Dispatch<React.SetStateAction<boolean>>,
	navigate: NavigateFunction,
	title: string,
	togglePopup: () => void,
	setPopupTitle?: Dispatch<React.SetStateAction<string>>,
	setPopupChild?: Dispatch<React.SetStateAction<ReactNode>>,
	waitingList?: string[] | undefined,
	socket: Socket | undefined
}

) {
	const startMultiGame = (room: string) => {
		socket?.emit("startMultiGame", { name: name, uuid: uuid, roomId: room });
		const goToRoute = room + '/' + name;
		navigate(goToRoute);
		setListButtonClickedSpec(false);
		setListButtonClicked(false);
	};

	const joinGame = (room: string) => {
		socket?.emit("joinGame", { name: name, uuid: uuid, roomId: room });
		setListButtonClickedSpec(false);
		setListButtonClicked(false);
	};

	const childForMyRooms = (room: string): ReactNode => {
		return (
			<div>
				<div className="flex flex-col my-1 space-y-5 p-10 ">
					<div className="bg-gray-700 rounded-lg">
						<h1 className="text-white text-xl font-semibold text-center mt-4">WAITING LIST</h1>
						<div className="flex flex-col space-y-3 p-4 max-h-48 overflow-y-auto">
							{waitingList && waitingList.map((player, index) => {
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

	const childForOtherRooms = (room: string): ReactNode => {
		return (
			<div>
				<div className="flex flex-col my-1 space-y-5 p-10">
					<button className="bg-[#508fe0] hover:bg-[#00916E] active:bg-bg-[#00916E] text-white font-bold py-2 px-4 rounded-full transition-all duration-200"
						onClick={() => { joinGame(room) }}>
						Join this game
					</button>
				</div>
			</div>
		);
	}

	if (uuid && name) {
		return (
			<div className="flex flex-col items-center justify-center h-screen">
				<div className="p-4 bg-gray-900 border-4 border-white rounded-full w-fit">
					<div className="text-white font-bold">
						{title}
					</div>
				</div>
				<div className="w-full max-w-4xl shadow-lg p-8 bg-gray-900 border-4 border-gray-700 rounded-lg m-4">
					<div className="items-center space-x-2 grid grid-cols-4 grid-rows-4 gap-4">
						{listRooms.map((room, index) => {
							return (
								<div key={index} className="flex bg-gray-700 hover:bg-gray-500 rounded-md transition-all duration-200">
									<button
										className="text-white font-bold py-2 px-4 rounded-full w-full"
										onClick={(e) => {
											e.preventDefault();
											socket?.emit("getWaitingList", { uuid: uuid, roomId: room });
											setRoomId((prev) => {
												const val = room;
												return val;
											});
											if (title === "ACTIVE ROOMLIST") {
												const goToRoute = room + '/' + name;
												navigate(goToRoute);
												setListButtonClickedSpec(false);
												setListButtonClicked(false);
											}
											else {
												if (setPopupTitle != undefined) {
													const newTitle = room;
													setPopupTitle(newTitle);
												}
												if (setPopupChild != undefined && title === "MY ROOMLIST") {
													const newPopupChild0 = childForMyRooms(room);
													setPopupChild(newPopupChild0);
												}
												else if (setPopupChild != undefined && title === "OTHERS ROOMLIST") {
													const newPopupChild1 = childForOtherRooms(room);
													setPopupChild(newPopupChild1);
												}
												togglePopup();

											}

										}}
									>
										{room}
									</button>
								</div>
							);
						})
						}
					</div>
				</div>
				<div className="text-center">
					<button className="bg-[#433a3f] hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full w-fit transition-all duration-200" onClick={() => {
						setListButtonClickedSpec(false);
						setListButtonClicked(false);
					}
					}>Menu</button>
				</div>
			</div>
		);
	}
}

export default roomList;