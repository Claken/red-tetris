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
	setListButtonClickedActive,
}: {
	setRoomId: Dispatch<React.SetStateAction<string>>,
	name: string,
	uuid: string | undefined,
	listRoomsAc: never[],
	setListButtonClicked: Dispatch<React.SetStateAction<boolean>>,
	setListButtonClickedActive: Dispatch<React.SetStateAction<boolean>>,
	navigate: NavigateFunction,
}

) {
	interface SmallBoxProps {
		content: string;
	  }
	
	const SmallBox: React.FC<SmallBoxProps> = ({ content }) => {
		return (
		  <div className="flex items-center justify-center bg-gray-900 text-white rounded-md">
			<button className="px-4 py-2 text-sm">{content}</button>
		  </div>
		);
	  };
	
	const GreatBox: React.FC = () => {
		return (
		  <div className="min-h-screen flex items-center justify-center bg-gray-100">
			{/* Grand Rectangle */}
			<div className="w-full max-w-4xl bg-gray-800 p-6 rounded-lg shadow-lg grid grid-cols-4 grid-rows-4 gap-4">
			  {/* Petits Rectangles */}
			  {[...Array(16)].map((_, index) => (
				<SmallBox key={index} content={`Content ${index + 1}`} />
			  ))}
			</div>
		  </div>
		);
	  };
	  

	if (uuid && name) {
		return (
			<div>
				{/* <GreatBox/> */}
				<p className="text-white text-center">ACTIVE ROOMS</p>
				<div className="flex flex-col items-center space-y-2">
					{listRoomsAc.map((room, index) => {
						return (
							<div key={index}>
								<button
									className="bg-[#433a3f] hover:bg-[#14C8B2] active:bg-[#0F978B] text-white font-bold py-2 px-4 rounded-full w-full max-w-[300px] transition-all duration-200"
									onClick={(e) => {
										e.preventDefault();
										setRoomId((prev) => {
											const val = room;
											return val;
										});
										const goToRoute = room + '/' + name;
										navigate(goToRoute);
										setListButtonClickedActive(false);
										setListButtonClicked(false);
									}}
								>
									GO BACK TO {room}
								</button>
							</div>
						);
					})
					}
				</div>
				<div className="text-center">
					<button className="bg-[#433a3f] hover:bg-red-700 active:bg-red-500 text-white font-bold py-2 px-4 rounded-full w-fit transition-all duration-200" onClick={() => {
						setListButtonClickedActive(false);
						setListButtonClicked(false);
					}
					}>Go to menu</button>
				</div>
			</div>
		);
	}
}

export default activeRoomsList;