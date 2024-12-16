export const cellColorMainGrid = (cell: number) => {
	switch (cell) {
		case (1): // turquoise
			return 'bg-[#00ffff]'
		case (2):
			return 'bg-[#0077ff]'
		case (3):
			return 'bg-[#ff7f00]'
		case (4):
			return 'bg-[#ffff00]'
		case (5):
			return 'bg-[#00ff00]'
		case (6):
			return 'bg-[#800080]'
		case (7):
			return 'bg-[#ff0000]'
		case (0): 	// grid's cell
			return 'bg-[#1a1b26]'
		case (102): // tetromino's shadown
			return 'bg-[#7d0202] opacity-75'
		case (20): // indestructible line
			return 'bg-gray-500'
	}
	return 'bg-red-400'
}

export const getTetroColor = (type: string) => {
	switch (type) {
		case ('I'):
			return 'bg-[#00ffff]'
		case ('J'):
			return 'bg-[#0077ff]'
		case ('L'):
			return 'bg-[#ff7f00]'
		case ('O'):
			return 'bg-[#ffff00]'
		case ('S'):
			return 'bg-[#00ff00]'
		case ('T'):
			return 'bg-[#800080]'
		case ('Z'):
			return 'bg-[#ff0000]'
	}
}