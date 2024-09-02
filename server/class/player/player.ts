import { Tetromino } from '../tetromino/tetromino';

export class Player {
  private _player_name: string;
  private _grid: number[][];
  private _tetrominos: Tetromino[];
  constructor(player_name: string) {
    this._player_name = player_name;
    this._grid = new Array(20).fill(null).map(() => new Array(10).fill(0));
    this._tetrominos = [];
  }
  getPlayerName(): string {
    return this._player_name;
  }
  getGrid(): number[][] {
    return this._grid;
  }

  getTetrominos(): Tetromino[] {
    return this._tetrominos;
  }

  addTeromino(tetromino: Tetromino): void {
    this._tetrominos.push(tetromino);
  }

  initTetrominoInsideGrid(): void {
    const t = this._tetrominos[0];
    const tShape = t.getShape();
    const startX = Math.floor((10 - tShape.length) / 2);
    const startY = 0;

    for (let y = 0; y < tShape.length; y++) {
      for (let x = 0; x < tShape[y].length; x++) {
        if (tShape[y][x] != 0)
          this._grid[startY + y][startX + x] = tShape[y][x];
      }
    }
  }

  fallTetromino(): void {
    // fall the Tetromino
  }
  moveDownTetromino(): void {
    // move down the Tetromino
  }
  moveLeftTetromino(): void {
    // move left the Tetromino
  }
  moveRightTetromino(): void {
    // move right the Tetromino
  }
  rotateTetromino(): void {
    // rotate the Tetromino
  }
  checkCollision(): boolean {
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
  updateGrid(): void {
    // update grid
  }
}
