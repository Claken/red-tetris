export interface Tetromino {
	type: string;
	shape: number[][];
	rotation: number;
}

export interface Spectrum {
	name: string;
	spectrum: number[][];
}

export interface OtherRoom {
	roomId: string;
	isStarted: boolean;
}

export interface RoomPlayer {
	name: string;
	uuid: string;
	isHost: boolean;
}

export interface LeaderboardEntry {
	name: string;
	score: number;
}

export interface GameLocationState {
	legacy?: boolean;
}
