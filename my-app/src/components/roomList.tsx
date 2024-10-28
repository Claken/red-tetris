import React, { ReactNode } from "react";
import { Dispatch } from "react";
import { NavigateFunction } from "react-router-dom";

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
}

) {
	const childForMyRooms = (): ReactNode => {
		return (
			<div>
				<div className="flex flex-col my-1 space-y-5 p-10">
					<button className="bg-[#508fe0] hover:bg-[#00916E] active:bg-bg-[#00916E] text-white font-bold py-2 px-4 rounded-full transition-all duration-200"
						onClick={() => {console.log("launch a game")}}>
						Launch a game
					</button>
				</div>
			</div>
		);
	}

	const childForOtherRooms = (): ReactNode => {
		return (
			<div>

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
													setPopupChild(childForMyRooms);
												}
												else if (setPopupChild != undefined && title === "OTHERS ROOMLIST") {

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