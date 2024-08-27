import { Tetromino } from '../tetromino/tetromino';

export class Player {
  private _player_name: string;
  private _grid: number[][];
  constructor(player_name: string) {
    this._player_name = player_name;
    this._grid = new Array(20).fill(null).map(() => new Array(10).fill(0));
  }
  getPlayerName(): string {
    return this._player_name;
  }
  getGrid(): number[][] {
    return this._grid;
  }
  fallTetromino(tetromino: Tetromino): void {
    // fall the Tetromino
  }
  moveDownTetromino(tetromino: Tetromino): void {
    // move down the Tetromino
  }
  moveLeftTetromino(tetromino: Tetromino): void {
    // move left the Tetromino
  }
  moveRightTetromino(tetromino: Tetromino): void {
    // move right the Tetromino
  }
  rotateTetromino(tetromino: Tetromino): void {
    // rotate the Tetromino
  }
  checkCollision(tetromino: Tetromino): boolean {
    // check collision
    return false;
  }
  checkGameOver(): boolean {
    // check game over
    return false;
  }
  clearLine(): void {
    // clear line
  }
  updateGrid(tetromino: Tetromino): void {
    // update grid
  }
}
