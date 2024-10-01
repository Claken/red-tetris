import { Tetromino } from '../tetromino/tetromino';
import { UNBREAKABLE_BRICK, SPECTRUM } from '../../constantes/constantes';

export class Player {
  private _player_name: string;
  private _uuid: string;
  private _grid: number[][];
  private _tetrominos: Tetromino[];
  private _isMaster: boolean;
  constructor(player_name: string, uuid: string) {
    this._uuid = uuid;
    this._player_name = player_name;
    this._grid = new Array(24).fill(null).map(() => new Array(10).fill(0));
    this._tetrominos = [];
    this._isMaster = false;
  }

  testgrid(num1: number): void {
    if (num1 == 1) {
      for (let y = 0; y < this._grid.length; y++) {
        for (let x = 0; x < this._grid[y].length; x++) {
          if (y == 23) this._grid[y][x] = 2;
        }
      }
    } else if (num1 == 2) {
      for (let y = 0; y < this._grid.length; y++) {
        for (let x = 0; x < this._grid[y].length; x++) {
          if (y == 23) this._grid[y][x] = 2;
          if (y == 22 && x % 2 == 0) this._grid[y][x] = 2;
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
      console.log('initTetrominoInsideGrid');
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
  private fallPositionYTetromino(): number {
    let endY = 24;
    // const tetromino = this._tetrominos[0];
    // console.log({ tetromino: tetromino });
    let startX = 10;
    let endX = 0;
    for (let y = 0; y < this._grid.length; y++) {
      for (let x = 0; this._grid[y].length > x; x++) {
        if (this._grid[y][x] == 1 && x < startX) {
          startX = x;
        }
        if (this._grid[y][x] == 1 && x >= endX) {
          endX = x + 1;
        }
      }
    }
    // const endX = startX + tetromino.getLentgth().x;
    // console.log({ startX: startX, endX: endX });
    for (let y = 0; y < this._grid.length; y++) {
      for (let x = startX; endX > x; x++) {
        if (
          (this._grid[y][x] == 2 || this._grid[y][x] == UNBREAKABLE_BRICK) &&
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
      if (this._grid[y][num] == 1) {
        return true;
      }
    }
    return false;
  }

  fallSpectrum(): void {
    for (let y = 0; y < this._grid.length; y++) {
      for (let x = 0; this._grid[y].length > x; x++) {
        if (this._grid[y][x] == SPECTRUM) this._grid[y][x] = 0;
      }
    }
    const points = [];
    for (let y = 0; y < this._grid.length; y++) {
      for (let x = 0; this._grid[y].length > x; x++) {
        if (this._grid[y][x] == 1) points.push({ y: y, x: x });
      }
    }
    this.fallTetromino();
    for (let y = 0; y < this._grid.length; y++) {
      for (let x = 0; this._grid[y].length > x; x++) {
        if (this._grid[y][x] == 1) this._grid[y][x] = SPECTRUM;
      }
    }
    for (let y = 0; y < this._grid.length; y++) {
      for (let x = 0; this._grid[y].length > x; x++) {
        if (points.length > 0) {
          if (points[0].y == y && points[0].x == x) {
            points.shift();
            this._grid[y][x] = 1;
          }
        }
      }
    }
  }

  // fallSpectrum(): void {
  //   for (let y = this._grid.length - 1; y > 0; y--) {
  //     for (let x = 0; this._grid[y].length > x; x++) {
  //       if (this._grid[y][x] == SPECTRUM) {
  //         this._grid[y][x] = 0;
  //       }
  //     }
  //   }
  //   if (this.isCollisionMove(1, 0)) return;
  //   let endY = this.fallPositionYTetromino();
  //   let enter = false;
  //   for (let y = this._grid.length - 1; y > -1; y--) {
  //     for (let x = 0; this._grid[y].length > x; x++) {
  //       if (this._grid[y][x] == 1) {
  //         enter = true;
  //         if (this._grid[endY][x] == 1) {
  //           console.log("j'ecris 11");
  //           console.log({ endY: endY, x: x });
  //           this._grid[endY][x] = 11;
  //         } else this._grid[endY][x] = SPECTRUM;
  //       }
  //     }
  //     if (enter) endY--;
  //   }
  //   // while (this.isCollisionSpectrum(1, 0) == false) {
  //   this.mooveDownSpectrum();
  //   this.mooveDownSpectrum();
  //   this.mooveDownSpectrum();
  //   for (let y = 0; y < this._grid.length; y++) {
  //     for (let x = 0; this._grid[y].length > x; x++) {
  //       if (this._grid[y][x] == 11) {
  //         this._grid[y][x] = 1;
  //       }
  //     }
  //   }
  // }

  // mooveDownSpectrum(): void {
  //   if (this.isCollisionSpectrum(1, 0)) return;
  //   let first = 0;
  //   for (let y = this._grid.length - 1; y > 0; y--) {
  //     if (first == 1) first = 2;
  //     for (let x = 0; this._grid[y].length > x; x++) {
  //       if (this._grid[y - 1][x] == 11 || this._grid[y - 1][x] == SPECTRUM) {
  //         if (this._grid[y - 1][x] == 11) first = 1;
  //         // if (this._grid[y - 1][x] == 11 && (first == 0 || first == 1)) {
  //         //   console.log('je rentre ici');
  //         //   first = 1;
  //         //   this._grid[y - 1][x] = 1;
  //         //   this._grid[y][x] = this._grid[y - 1][x];
  //         //   this._grid[y - 1][x] = 0;
  //         // } else {
  //         this._grid[y][x] = this._grid[y - 1][x];
  //         this._grid[y - 1][x] = 0;
  //         // }
  //       }
  //     }
  //   }
  //   if (first == 1) {
  //     let end = 0;
  //     for (let y = 0; y < this._grid.length; y++) {
  //       if (end != 0) return;
  //       for (let x = 0; this._grid[y].length > x; x++) {
  //         if (this._grid[y][x] == 11) {
  //           console.log('je rentre ici');
  //           end = 1;
  //           this._grid[y][x] = 1;
  //         }
  //       }
  //     }
  //   }
  // }

  isCollisionSpectrum(cy: number, cx: number): boolean {
    for (let y = 0; y < this._grid.length; y++) {
      for (let x = 0; this._grid[y].length > x; x++) {
        // console.log(this._grid[y][x]);
        if (
          (this._grid[y][x] == SPECTRUM || this._grid[y][x] == 11) &&
          (y + cy > 23 ||
            x + cx > 9 ||
            x + cx < 0 ||
            this._grid[y + cy][x + cx] == 2 ||
            this._grid[y + cy][x + cx] == UNBREAKABLE_BRICK)
        ) {
          return true;
        }
      }
    }
    return false;
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
    while (this.isCollisionMove(1, 0) == false) {
      this.moveDownTetromino(1);
    }
    // this.fallSpectrum();
  }
  moveDownTetromino(num?: number): void {
    if (this.isCollisionMove(1, 0)) return;
    for (let y = this._grid.length - 1; y > 0; y--) {
      for (let x = 0; this._grid[y].length > x; x++) {
        if (this._grid[y - 1][x] == 1) {
          this._grid[y][x] = this._grid[y - 1][x];
          this._grid[y - 1][x] = 0;
        }
      }
    }
    if (num != undefined) this.fallSpectrum();
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
    this.fallSpectrum();
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
      this._tetrominos[0].rotateTetromino();
      this._tetrominos[0].rotateTetromino();
      this._tetrominos[0].rotateTetromino();
      return;
    }

    for (let y = startY, i = 0; y < endY; y++, i++) {
      for (let x = startX, z = 0; x < endX; x++, z++) {
        if (this._grid[y][x] != 2 && this._grid[y][x] != UNBREAKABLE_BRICK) {
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
          this._grid[y][x] == 2 ||
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
          this._grid[y][x] == 1 &&
          (y + cy > 23 ||
            x + cx > 9 ||
            x + cx < 0 ||
            this._grid[y + cy][x + cx] == 2 ||
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
        (elem: number) => elem == 2 || elem == UNBREAKABLE_BRICK,
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
        if (this._grid[y][x] == 2) {
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
      this._grid.unshift(new Array(10).fill(0));
    }
    return nbrLineToDestroy;
  }
  updateGrid(touched: number): any {
    let transform: boolean = false;
    for (let y = this._grid.length - 1; y > 0; y--) {
      for (let x = 0; this._grid[y].length > x; x++) {
        if (
          this._grid[y][x] == 1 &&
          (y == 23 ||
            this._grid[y + 1][x] == 2 ||
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
          if (this._grid[y][x] == 1) {
            this._grid[y][x] = 2;
          }
        }
      }
      this._tetrominos.shift();
      // transform = false;
    }
    const nbrLineToAdd = this.clearLines();
    // let nbrLineToAdd: number = 0;
    // let canIstartCountLinesToAdd: boolean = false;
    // for (let y = 0; y < this._grid.length; y++) {
    //   if (this._grid[y].some((elem) => elem == 2)) {
    //     canIstartCountLinesToAdd = true;
    //   }
    //   if (
    //     canIstartCountLinesToAdd &&
    //     this._grid[y].every((elem) => elem == 0)
    //   ) {
    //     this._grid.splice(y, 1);
    //     nbrLineToAdd++;
    //   }
    // }
    // for (let i = 0; i < nbrLineToAdd; i++) {
    //   this._grid.unshift(new Array(10).fill(0));
    // }
    // console.log({ transform: transform });
    if (transform) {
      // console.log('transform');
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
      this._grid.push(new Array(10).fill(3));
    }
  }
}
