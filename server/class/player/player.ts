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

  testgrid(num1: number): void {
    if (num1 == 1) {
      for (let y = 0; y < this._grid.length; y++) {
        for (let x = 0; x < this._grid[y].length; x++) {
          if (y == 19) this._grid[y][x] = 2;
        }
      }
    } else if (num1 == 2) {
      for (let y = 0; y < this._grid.length; y++) {
        for (let x = 0; x < this._grid[y].length; x++) {
          if (y == 19) this._grid[y][x] = 2;
          if (y == 18 && x % 2 == 0) this._grid[y][x] = 2;
        }
      }
    }
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

  private fallPositionYTetromino(): number {
    let endY = 20;
    const tetromino = this._tetrominos[0];
    let startX = 10;
    for (let y = 0; y < this._grid.length; y++) {
      for (let x = 0; this._grid[y].length > x; x++) {
        if (this._grid[y][x] == 1 && x < startX) {
          startX = x;
        }
      }
    }
    const endX = startX + tetromino.getLentgth().x;
    for (let y = 0; y < this._grid.length; y++) {
      for (let x = startX; endX > x; x++) {
        if (this._grid[y][x] == 2) {
          endY = y;
        }
      }
    }
    return endY - 1;
  }
  fallTetromino(): void {
    if (this.isCollisionMove(1, 0)) return;
    let endY = this.fallPositionYTetromino();
    let enter = false;
    for (let y = this._grid.length - 1; y > -1; y--) {
      for (let x = 0; this._grid[y].length > x; x++) {
        if (this._grid[y][x] == 1) {
          enter = true;
          this._grid[endY][x] = 1;
          this._grid[y][x] = 0;
        }
      }
      if (enter) {
        endY--;
      }
    }
  }
  moveDownTetromino(): void {
    if (this.isCollisionMove(1, 0)) return;
    for (let y = this._grid.length - 1; y > 0; y--) {
      for (let x = 0; this._grid[y].length > x; x++) {
        if (this._grid[y - 1][x] == 1) {
          this._grid[y][x] = this._grid[y - 1][x];
          this._grid[y - 1][x] = 0;
        }
      }
    }
  }
  moveLeftTetromino(): void {
    if (this.isCollisionMove(0, -1)) return;
    for (let y = 0; y < this._grid.length; y++) {
      for (let x = 0; this._grid[y].length > x; x++) {
        if (this._grid[y][x] == 1) {
          this._grid[y][x - 1] = 1;
          this._grid[y][x] = 0;
        }
      }
    }
  }
  moveRightTetromino(): void {
    if (this.isCollisionMove(0, 1)) return;
    for (let y = 0; y < this._grid.length; y++) {
      for (let x = this._grid[y].length - 1; x > 0; x--) {
        if (this._grid[y][x - 1] == 1) {
          this._grid[y][x] = 1;
          this._grid[y][x - 1] = 0;
        }
      }
    }
  }
  rotateTetromino(): void {
    const lengthTetro = this._tetrominos[0].getLentgth();
    this._tetrominos[0].rotateTetromino();
    const shape = this._tetrominos[0].getShape();
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    for (let y = 0; y < this._grid.length; y++) {
      for (let x = 0; this._grid[y].length > x; x++) {
        if (this._grid[y][x] == 1) {
          startX = x - lengthTetro.lengthXBeforeNumber;
          startY = y - lengthTetro.lengthYBeforeNumber;
          endX = startX + lengthTetro.x;
          endY = startY + lengthTetro.y;
          y = this._grid.length - 1;
          x = this._grid[y].length;
        }
      }
    }

    if (this.isColisionRotate({ startY, startX, endY, endX })) {
      return;
    }

    for (let y = startY, i = 0; y < endY; y++, i++) {
      for (let x = startX, z = 0; x < endX; x++, z++) {
        if (this._grid[y][x] != 2) {
          this._grid[y][x] = shape[i][z];
        }
      }
    }
  }

  isColisionRotate(p: any): boolean {
    // const copie = this._grid.map((arr) => arr.slice());
    for (let y = p.startY, i = 0; y < p.endY; y++, i++) {
      for (let x = p.startX, z = 0; x < p.endX; x++, z++) {
        if (y < 0 || x < 0 || y > 19 || x > 19 || this._grid[y][x] == 2) {
          return true;
        }
      }
    }
    return false;
  }

  isCollisionMove(cy: number, cx: number): boolean {
    for (let y = 0; y < this._grid.length; y++) {
      for (let x = 0; this._grid[y].length > x; x++) {
        if (
          this._grid[y][x] == 1 &&
          (y + cy > 19 ||
            x + cx > 9 ||
            x + cx < 0 ||
            this._grid[y + cy][x + cx] == 2)
        ) {
          return true;
        }
      }
    }
    return false;
  }
  checkGameOver(): boolean {
    // check game over
    return false;
  }
  clearLines(): void {
    // clear line
    for (let y = this._grid.length - 1; y > 0; y--) {
      let count = 0;
      for (let x = 0; this._grid[y].length > x; x++) {
        if (this._grid[y][x] == 2) {
          count++;
        }
      }
      if (count == 10) {
        for (let x = 0; this._grid[y].length > x; x++) {
          this._grid[y][x] = 0;
        }
      }
    }
  }
  updateGrid(): void {
    // tranform number with colision 1 to 2.
    // and destroy line completed with 2.
    // and move down all line above.
    let transform: boolean = false;
    for (let y = this._grid.length - 1; y > 0; y--) {
      for (let x = 0; this._grid[y].length > x; x++) {
        if (this._grid[y][x] == 1 && (y == 19 || this._grid[y + 1][x] == 2)) {
          transform = true;
        }
      }
    }
    if (transform == true) {
      for (let y = this._grid.length - 1; y > 0; y--) {
        for (let x = 0; this._grid[y].length > x; x++) {
          if (this._grid[y][x] == 1) {
            this._grid[y][x] = 2;
          }
        }
      }
      this._tetrominos.shift();
      transform = false;
    }
    this.clearLines();
    let nbrLineToAdd: number = 0;
    let canIstartCountLinesToAdd: boolean = false;
    for (let y = 0; y < this._grid.length; y++) {
      if (this._grid[y].some((elem) => elem == 2)) {
        canIstartCountLinesToAdd = true;
      }
      if (
        canIstartCountLinesToAdd &&
        this._grid[y].every((elem) => elem == 0)
      ) {
        this._grid.splice(y, 1);
        nbrLineToAdd++;
      }
    }
    for (let i = 0; i < nbrLineToAdd; i++) {
      this._grid.unshift(new Array(10).fill(0));
    }
    if (transform) {
      this.initTetrominoInsideGrid();
    }
  }
}
