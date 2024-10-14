import { Tetromino } from '../tetromino/tetromino';
import {
  I,
  J,
  L,
  O,
  S,
  T,
  Z,
  E,
  B,
  UNBREAKABLE_BRICK,
  SPECTRUM,
} from '../../constantes/constantes';

export class Player {
  private _player_name: string;
  private _uuid: string;
  private _grid: number[][];
  private _tetrominos: Tetromino[];
  private _isMaster: boolean;
  constructor(player_name: string, uuid: string) {
    this._uuid = uuid;
    this._player_name = player_name;
    this._grid = new Array(24).fill(null).map(() => new Array(10).fill(E));
    this._tetrominos = [];
    this._isMaster = false;
  }

  testgrid(num1: number): void {
    if (num1 == 1) {
      for (let y = 0; y < this._grid.length; y++) {
        for (let x = 0; x < this._grid[y].length; x++) {
          if (y == 23) this._grid[y][x] = B;
        }
      }
    } else if (num1 == 2) {
      for (let y = 0; y < this._grid.length; y++) {
        for (let x = 0; x < this._grid[y].length; x++) {
          if (y == 23) this._grid[y][x] = B;
          if (y == 22 && x % 2 == 0) this._grid[y][x] = B;
        }
      }
    }
  }

  getPlayerName(): string {
    return this._player_name;
  }

  getUuid(): string {
    return this._uuid;
  }
  getGrid(): number[][] {
    return this._grid;
  }

  getTetrominos(): Tetromino[] {
    return this._tetrominos;
  }

  getIsMaster(): boolean {
    return this._isMaster;
  }

  setIsMaster(right: boolean): void {
    this._isMaster = right;
  }

  addTeromino(tetromino: Tetromino): void {
    this._tetrominos.push(tetromino);
  }

  // print2DArray = (arr: any) => {
  //   console.log('[');
  //   for (let i = 0; i < arr.length; i++) {
  //     console.log('  [' + arr[i].join(',') + ']');
  //   }
  //   console.log(']');
  // };

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

    for (let i = 0; i < 3; i++) {
      this.moveDownTetromino();
    }
  }

  action(action: string) {
    if (action == 'left') {
      this.moveLeftTetromino();
    } else if (action == 'right') {
      this.moveRightTetromino();
    } else if (action == 'down') {
      this.moveDownTetromino();
    } else if (action == 'up') {
      this.rotateTetromino();
    } else if (action == 'space') {
      this.fallTetromino();
    }
  }

  private isPartOfTetromino(num: number): boolean {
    return (
      num == I ||
      num == J ||
      num == L ||
      num == O ||
      num == S ||
      num == T ||
      num == Z
    );
  }

  private fallPositionYTetromino(): number {
    let endY = 24;
    let startX = 10;
    let endX = 0;
    for (let y = 0; y < this._grid.length; y++) {
      for (let x = 0; this._grid[y].length > x; x++) {
        if (this.isPartOfTetromino(this._grid[y][x]) && x < startX) {
          startX = x;
        }
        if (this.isPartOfTetromino(this._grid[y][x]) && x >= endX) {
          endX = x + 1;
        }
      }
    }
    for (let y = 0; y < this._grid.length; y++) {
      for (let x = startX; endX > x; x++) {
        if (
          (this._grid[y][x] == B || this._grid[y][x] == UNBREAKABLE_BRICK) &&
          this.checkIfBrick(x)
        ) {
          endY = y;
          return endY - 1;
        }
      }
    }
    return endY - 1;
  }

  checkIfBrick(num: number): boolean {
    for (let y = 0; y < this._grid.length; y++) {
      if (this.isPartOfTetromino(this._grid[y][num])) {
        return true;
      }
    }
    return false;
  }

  fallSpectrum(): void {
    for (let y = 0; y < this._grid.length; y++) {
      for (let x = 0; this._grid[y].length > x; x++) {
        if (this._grid[y][x] == SPECTRUM) this._grid[y][x] = E;
      }
    }
    const points = [];
    let val = 1;
    for (let y = 0; y < this._grid.length; y++) {
      for (let x = 0; this._grid[y].length > x; x++) {
        if (this.isPartOfTetromino(this._grid[y][x])) {
          points.push({ y: y, x: x });
          val = this._grid[y][x];
        }
      }
    }
    if (points.length == 0) return;
    this.fallTetromino(1);

    for (let y = 0; y < this._grid.length; y++) {
      for (let x = 0; this._grid[y].length > x; x++) {
        if (this.isPartOfTetromino(this._grid[y][x]))
          this._grid[y][x] = SPECTRUM;
      }
    }
    for (let y = 0; y < this._grid.length; y++) {
      for (let x = 0; this._grid[y].length > x; x++) {
        if (points.length > 0) {
          if (points[0].y == y && points[0].x == x) {
            points.shift();
            this._grid[y][x] = val;
          }
        }
      }
    }
  }

  isCollisionSpectrum(cy: number, cx: number): boolean {
    for (let y = 0; y < this._grid.length; y++) {
      for (let x = 0; this._grid[y].length > x; x++) {
        // console.log(this._grid[y][x]);
        if (
          (this._grid[y][x] == SPECTRUM || this._grid[y][x] == 11) &&
          (y + cy > 23 ||
            x + cx > 9 ||
            x + cx < 0 ||
            this._grid[y + cy][x + cx] == B ||
            this._grid[y + cy][x + cx] == UNBREAKABLE_BRICK)
        ) {
          return true;
        }
      }
    }
    return false;
  }

  fallTetromino(num?: number): void {
    while (this.isCollisionMove(1, 0) == false) {
      this.moveDownTetromino(1);
    }
    if (num == undefined) this.updateGrid(0);
  }
  moveDownTetromino(num?: number): void {
    if (this.isCollisionMove(1, 0)) return;
    for (let y = this._grid.length - 1; y > 0; y--) {
      for (let x = 0; this._grid[y].length > x; x++) {
        if (this.isPartOfTetromino(this._grid[y - 1][x])) {
          this._grid[y][x] = this._grid[y - 1][x];
          this._grid[y - 1][x] = E;
        }
      }
    }
    if (num == undefined) this.fallSpectrum();
  }
  moveLeftTetromino(): void {
    if (this.isCollisionMove(0, -1)) return;
    for (let y = 0; y < this._grid.length; y++) {
      for (let x = 0; this._grid[y].length > x; x++) {
        if (this.isPartOfTetromino(this._grid[y][x])) {
          this._grid[y][x - 1] = this._grid[y][x];
          this._grid[y][x] = 0;
        }
      }
    }
    this.fallSpectrum();
  }
  moveRightTetromino(): void {
    if (this.isCollisionMove(0, 1)) return;
    for (let y = 0; y < this._grid.length; y++) {
      for (let x = this._grid[y].length - 1; x > 0; x--) {
        if (this.isPartOfTetromino(this._grid[y][x - 1])) {
          this._grid[y][x] = this._grid[y][x - 1];
          this._grid[y][x - 1] = E;
        }
      }
    }
    this.fallSpectrum();
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
        if (this.isPartOfTetromino(this._grid[y][x])) {
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
      this._tetrominos[0].rotateTetromino();
      this._tetrominos[0].rotateTetromino();
      this._tetrominos[0].rotateTetromino();
      return;
    }

    for (let y = startY, i = 0; y < endY; y++, i++) {
      for (let x = startX, z = 0; x < endX; x++, z++) {
        if (this._grid[y][x] != B && this._grid[y][x] != UNBREAKABLE_BRICK) {
          this._grid[y][x] = shape[i][z];
        }
      }
    }
    this.fallSpectrum();
  }

  isColisionRotate(p: any): boolean {
    // const copie = this._grid.map((arr) => arr.slice());
    for (let y = p.startY, i = 0; y < p.endY; y++, i++) {
      for (let x = p.startX, z = 0; x < p.endX; x++, z++) {
        if (
          y < 0 ||
          x < 0 ||
          y > 23 ||
          x > 9 ||
          this._grid[y][x] == B ||
          this._grid[y][x] == UNBREAKABLE_BRICK
        ) {
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
          this.isPartOfTetromino(this._grid[y][x]) &&
          (y + cy > 23 ||
            x + cx > 9 ||
            x + cx < 0 ||
            this._grid[y + cy][x + cx] == B ||
            this._grid[y + cy][x + cx] == UNBREAKABLE_BRICK)
        ) {
          return true;
        }
      }
    }
    return false;
  }
  isPlayerLost(): boolean {
    // checker ceci apres un update soit finnis
    if (
      this._grid[3].some(
        (elem: number) => elem == B || elem == UNBREAKABLE_BRICK,
      )
    ) {
      return true;
    }
    return false;
  }
  clearLines(): number {
    let nbrLineToDestroy = 0;
    for (let y = this._grid.length - 1; y > 0; y--) {
      let count = 0;
      for (let x = 0; this._grid[y].length > x; x++) {
        if (this._grid[y][x] == B) {
          count++;
        }
      }
      if (count == 10) {
        for (let x = 0; this._grid[y].length > x; x++) {
          this._grid[y][x] = 0;
        }
        this._grid.splice(y, 1);
        nbrLineToDestroy++;
      }
    }
    for (let i = 0; i < nbrLineToDestroy; i++) {
      this._grid.unshift(new Array(10).fill(E));
    }
    return nbrLineToDestroy;
  }
  updateGrid(touched: number): any {
    let transform: boolean = false;
    for (let y = this._grid.length - 1; y > 0; y--) {
      for (let x = 0; this._grid[y].length > x; x++) {
        if (
          this.isPartOfTetromino(this._grid[y][x]) &&
          (y == 23 ||
            this._grid[y + 1][x] == B ||
            this._grid[y + 1][x] == UNBREAKABLE_BRICK)
        ) {
          transform = true;
        }
      }
    }
    if (transform == false) {
      touched = 1;
    }
    if (transform == true) {
      touched--;
      if (touched == 0) transform = false;
      if (touched == -1) {
        transform = true;
        touched = 1;
      }
    }
    if (transform == true) {
      for (let y = this._grid.length - 1; y > 0; y--) {
        for (let x = 0; this._grid[y].length > x; x++) {
          if (this.isPartOfTetromino(this._grid[y][x])) {
            this._grid[y][x] = B;
          }
        }
      }
      this._tetrominos.shift();
    }
    const nbrLineToAdd = this.clearLines();
    if (transform) {
      this.initTetrominoInsideGrid();
    }
    if (transform && nbrLineToAdd > 0) {
      console.log({ nbrLineToAdd: nbrLineToAdd });
    }
    return { nbrLineToAdd: nbrLineToAdd - 1, touched: touched };
  }

  addLine(nbrLine: number): void {
    for (let i = 0; i < nbrLine; i++) {
      this._grid.shift();
      this._grid.push(new Array(10).fill(UNBREAKABLE_BRICK));
    }
  }
}
