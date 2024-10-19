import React from "react";
import { Dispatch } from "react";
import { NavigateFunction } from "react-router-dom";

function myRoomsList({
	setRoomId,
	uuid,
	name,
	listRoomsCreate,
	setListButtonClicked,
	navigate,
	setListButtonClickedRooms,
}: {
	setRoomId: Dispatch<React.SetStateAction<string>>,
	name: string,
	uuid: string | undefined,
	listRoomsCreate: never[],
	setListButtonClicked: Dispatch<React.SetStateAction<boolean>>,
	navigate: NavigateFunction,
	setListButtonClickedRooms: Dispatch<React.SetStateAction<boolean>>,
}

) {
	if (uuid && name) {
		return (
			<div>
				<p className="text-white text-center">ROOM.S CREATED</p>
				{listRoomsCreate.map((room, index) => {
					return (
						<div key={index}>
							<button
								className="bg-[#433a3f] hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full"
								onClick={(e) => {
									e.preventDefault();
									// setRoomId((prev) => {
									// 	const val = room;
									// 	return val;
									// });
									// const goToRoute = room + '/' + name;
									// navigate(goToRoute);
									setListButtonClickedRooms(false);
									setListButtonClicked(false);
								}}
							>
								START GAME IN {room}
							</button>
						</div>
					);
				})
				}
				<div className="text-center">
					<button className="bg-red-500 hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full w-fit" onClick={() => {
						setListButtonClickedRooms(false);
						setListButtonClicked(false);
						}}>Go to menu</button>
				</div>
			</div>
		);
	}
}

export default myRoomsList