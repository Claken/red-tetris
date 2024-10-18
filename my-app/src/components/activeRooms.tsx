import React from "react";
import { Dispatch } from "react";
import { NavigateFunction } from "react-router-dom";

function activeRoomsList({
	setRoomId,
	uuid,
	name,
	listRoomsAc,
	setListButtonClicked,
	navigate,
}: {
	setRoomId: Dispatch<React.SetStateAction<string>>,
	name: string,
	uuid: string | undefined,
	listRoomsAc: never[],
	setListButtonClicked: Dispatch<React.SetStateAction<boolean>>,
	navigate: NavigateFunction,
}

) {
	if (uuid && name) {
		return (
			<div>
				<p className="text-white text-center">ACTIVE ROOMS</p>
				{listRoomsAc.map((room, index) => {
					return (
						<div key={index}>
							<button
								className="text-white"
								onClick={(e) => {
									e.preventDefault();
									setRoomId((prev) => {
										const val = room;
										return val;
									});
									const goToRoute = room + '/' + name;
									navigate(goToRoute);
									setListButtonClicked(false);
								}}
							>
								revenir sur la room {room}
							</button>
						</div>
					);
				})
				}
				<div className="text-center">
					<button className="bg-red-500 hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full w-fit" onClick={() => setListButtonClicked(false)}>Go to menu</button>
				</div>
			</div>
		);
	}
}

export default activeRoomsList;