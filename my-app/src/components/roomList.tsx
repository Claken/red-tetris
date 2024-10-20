import React from "react";
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
}: {
	setRoomId: Dispatch<React.SetStateAction<string>>,
	name: string,
	uuid: string | undefined,
	listRooms: never[],
	setListButtonClicked: Dispatch<React.SetStateAction<boolean>>,
	setListButtonClickedSpec: Dispatch<React.SetStateAction<boolean>>,
	navigate: NavigateFunction,
	title: string,
}

) {
	if (uuid && name) {
		return (
			<div>
				<div className="">
					<button className="bg-[#433a3f] hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full w-fit transition-all duration-200" onClick={() => {
						setListButtonClickedSpec(false);
						setListButtonClicked(false);
					}
					}>Go to menu</button>
				</div>
				<div className="text-white">
					{title}
				</div>
				<div className="w-full max-w-4xl bg-gray-800 p-6 rounded-lg shadow-lg">
					<div className="items-center space-x-2 grid grid-cols-4 grid-rows-4 gap-4">
						{listRooms.map((room, index) => {
							return (
								<div key={index} className="flex bg-gray-900 hover:bg-gray-500 rounded-md transition-all duration-200">
									<button
										className="text-white font-bold py-2 px-4 rounded-full w-full"
										onClick={(e) => {
											e.preventDefault();
											setRoomId((prev) => {
												const val = room;
												return val;
											});
											const goToRoute = room + '/' + name;
											navigate(goToRoute);
											setListButtonClickedSpec(false);
											setListButtonClicked(false);
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
			</div>
		);
	}
}

export default roomList;