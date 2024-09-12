import { createContext, useState, ReactNode } from 'react';
import { IPlayerContext } from '../interfaces/playerContext.interface';

const PlayerContext = createContext<IPlayerContext | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {

	const [name, setName] = useState<string>("");

	return <PlayerContext.Provider value={{ name, setName }}>
		{children}
	</PlayerContext.Provider>
}