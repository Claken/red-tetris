import { useState } from "react";

export const placeTetromino = (grid: number[][], tetromino: number[][], x: number, y: number): number[][] => {

	const newGrid = grid.map(row => [...row]);

	tetromino.forEach((row, rowIndex) => {
		row.forEach((cell, colIndex) => {
			if (cell) {
				newGrid[y + rowIndex][x + colIndex] = cell;
			}
		});
	});
	return newGrid;
};


function GamePage() {

	const numRows = 20;
	const numCols = 10;

	const [grid, setGrid] = useState<number[][]>(Array.from({ length: numRows }, () =>
		Array(numCols).fill(0)
	));

	return (
		<div className="bg-black h-screen">
			<div className="flex items-center justify-center h-screen">\
				<div className="border-8 border-red-500">
					<div className="border-2 border-black">
						<div className="grid grid-cols-10 gap-0.5">
							{grid.map((row, rowIndex) =>
								row.map((cell, colIndex) => (
									<div
										key={`${rowIndex}-${colIndex}`}
										className={`w-4 h-4 sm:w-4 sm:h-4 md:w-6 md:h-6 lg:w-6 lg:h-6 lx:w-8 lx:h-8 border border-red-700 ${cell ? 'bg-red-500' : 'bg-red-900'}`}
									></div>
								))
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default GamePage;