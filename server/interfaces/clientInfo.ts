export interface ClientInfo {
  socketsId: string[];
  ownedRoomsId: string[];
  otherRoomsId: string[];
  lobbyRoomsId: string[]; // rooms joined via the new joinRoom/lobby system
  name: string;
}
