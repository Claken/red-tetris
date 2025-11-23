import React from 'react';

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

export const displayTetromino = (tetromino: any) => {
		const tetroColor = getTetroColor(tetromino.type);
		return tetromino.shape.map((row: number[], rowIndex: number) => (
			<div data-testid={rowIndex} key={rowIndex} className="flex">
				{row.map((cell: number, colIndex: number) => (
					<div
						key={colIndex}
						className={`w-4 h-4 border border-gray-900 ${cell !== 0 ? tetroColor : 'bg-transparent'}`}
					>
					</div>
				))}
			</div>
		));
	};

export const displaySpectrums = (specList: any, left: boolean) => {
		const idx = 6;
		const rightOrLeft = (index: any): boolean => {
			console.log("index == " + index);
			if (left) {
				return index < idx;
			}
			return index >= idx;
		}

		return (
			<div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-2 xl:gap-x-4">
				{specList.map((spectrum: any, index: number) => (
					<div key={index} className="w-[60px] sm:w-[70px] md:w-[80px]">
						{rightOrLeft(index) && <div className="">
							<h3 className="text-xs sm:text-sm md:text-lg text-white text-center truncate font-semibold mb-1 sm:mb-2">{spectrum.name}</h3>
							<div
								className="grid grid-cols-10 gap-0"
							>
								{spectrum.spectrum.flat().map((value: number, idx: number) => (
									<div
										key={idx}
										data-testid="spectrum-bg"
										className={`w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 border border-gray-700 ${value > 0 ? (value === 1 ? 'bg-cyan-500' : 'bg-red-800') : 'bg-transparent'
											}`}
									></div>
								))}
							</div>
						</div>}
					</div>
				))}
			</div>
		);
	}