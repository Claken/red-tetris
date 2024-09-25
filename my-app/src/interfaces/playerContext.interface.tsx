import React from 'react'

export interface IPlayerContext {
	name: string;
	setName: React.Dispatch<React.SetStateAction<string>>;
	id: string | undefined;
	setId: React.Dispatch<React.SetStateAction<string | undefined>>;

}