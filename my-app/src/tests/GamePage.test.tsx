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

test('it should not modify the original grid', () => {
  const grid = Array.from({ length: 5 }, () => Array(5).fill(0));
  const tetromino = [
    [1, 1],
    [1, 1],
  ];

  const originalGrid = [...grid.map(row => [...row])];
  placeTetromino(grid, tetromino, 2, 2);

  expect(grid).toEqual(originalGrid);
});