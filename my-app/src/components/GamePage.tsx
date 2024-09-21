import { useState } from "react";

function GamePage() {

	const numRows = 20;
	const numCols = 10;

	const [grid, setGrid] = useState(Array.from({ length: numRows }, () =>
		Array(numCols).fill(0)
	));



	return (
		<div className="bg-black h-screen">
			<div className="flex items-center justify-center h-screen">
				<div className="border-8 border-red-500">
				<div className="border-2 border-black">
					<div className="grid grid-cols-10 gap-0.5">
						{grid.map((row, rowIndex) =>
							row.map((cell, colIndex) => (
								<div
									key={`${rowIndex}-${colIndex}`}
									className={`w-8 h-8 border border-red-700 ${cell ? 'bg-red-500' : 'bg-red-900'}`}
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