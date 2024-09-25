import { createContext, useState, ReactNode, useContext } from 'react';
import { IPlayerContext } from '../interfaces/playerContext.interface';

const PlayerContext = createContext<IPlayerContext | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {

	const [name, setName] = useState<string>("");
	const [id, setId] = useState<string | undefined>(undefined);

	return <PlayerContext.Provider value={{ name, setName, id, setId }}>
		{children}
	</PlayerContext.Provider>
};

export const usePlayer= () => {
	return useContext(PlayerContext);
}