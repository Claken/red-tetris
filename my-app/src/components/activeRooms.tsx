import { Dispatch } from "react";

function activeRoomsList({
setRoomId,
uuid,
name,
listRoomsAc,
}: {
	setRoomId : Dispatch<React.SetStateAction<string>>,
	name: string,
	uuid: string | undefined,
	listRoomsAc: Dispatch<React.SetStateAction<[]>>
}

) {
	if (uuid && name) {
		return (
		  <div>
			<p>active Rooms</p>
			{listRoomsAc.map((room, index) => {
			  return (
				<div key={index}>
				  <button
					onClick={(e) => {
					  e.preventDefault();
					  setRoomId((prev) => {
						const val = room;
						return val;
					  });
					}}
				  >
					revenir sur la room {room}
				  </button>
				</div>
			  );
			})}
		  </div>
		);
	  }
}

export default activeRoomsList;