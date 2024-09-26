import { placeTetromino } from "../components/GamePage";
import { expect, test } from 'vitest'

test('placeTetromino', () => {
	const grid = Array.from({ length: 5 }, () => Array(5).fill(0));
    const tetromino = [
      [1, 1, 0],
      [0, 1, 1],
    ];
    const expectedGrid = [
      [0, 0, 0, 0, 0],
      [0, 1, 1, 0, 0],
      [0, 0, 1, 1, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ];

    const newGrid = placeTetromino(grid, tetromino, 1, 1);
    expect(newGrid).toEqual(expectedGrid);
})