import {
  E,
  I,
  J,
  L,
  O,
  S,
  T,
  Z,
  UNBREAKABLE_BRICK,
} from '../../constantes/constantes';

interface InterfaceTetromino {
  rotation: number; // rotate the piece in degrees
  shape: number[][]; // shape of the piece
  type: string;
}

export const allTetrominos: InterfaceTetromino[] = [
  {
    type: 'I',
    rotation: 0,
    shape: [
      [E, E, E, E],
      [I, I, I, I],
      [E, E, E, E],
      [E, E, E, E],
    ],
  },
  {
    type: 'J',
    rotation: 0,
    shape: [
      [J, E, E],
      [J, J, J],
      [E, E, E],
    ],
  },
  {
    type: 'L',
    rotation: 0,
    shape: [
      [E, E, L],
      [L, L, L],
      [E, E, E],
    ],
  },
  {
    type: 'O',
    rotation: 0,
    shape: [
      [O, O],
      [O, O],
    ],
  },
  {
    type: 'S',
    rotation: 0,
    shape: [
      [E, S, S],
      [S, S, E],
      [E, E, E],
    ],
  },
  {
    type: 'T',
    rotation: 0,
    shape: [
      [E, T, E],
      [T, T, T],
      [E, E, E],
    ],
  },
  {
    type: 'Z',
    rotation: 0,
    shape: [
      [Z, Z, E],
      [E, Z, Z],
      [E, E, E],
    ],
  },
];

export class Tetromino {
  //create private variable
  // reflechir a comment l'objet piece doit etre construit
  // private tetromino: InterfaceTetromino;
  private rotation: number;
  private shape: number[][];
  private type: string;
  private lengthX: number;
  private lengthY: number;
  private lengthYBeforeNumber: number;
  private lengthXBeforeNumber: number;

  constructor(rotation: number = 0, shape: number[][] = [], type: string = '') {
    this.rotation = rotation as 0 | 90 | 180 | 270;
    this.shape = shape;
    this.type = type;
    if (this.shape.length == 0) {
      this.lengthXBeforeNumber = 0;
      this.lengthYBeforeNumber = 0;
      this.lengthX = 0;
      this.lengthY = 0;
    } else {
      this.setLengthTetromino();
    }
  }

  private isPartOfTetromino(num: number) {
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

  private setLengthTetromino() {
    this.lengthX = this.shape[0].length;
    this.lengthY = this.shape.length;
    for (let y = 0; y < this.lengthY; y++) {
      for (let x = 0; x < this.lengthX; x++) {
        if (this.isPartOfTetromino(this.shape[y][x])) {
          this.lengthYBeforeNumber = y;
          this.lengthXBeforeNumber = x;
          x = this.lengthX;
          y = this.lengthY;
        }
      }
    }
  }

  getLentgth() {
    return {
      x: this.lengthX,
      y: this.lengthY,
      lengthYBeforeNumber: this.lengthYBeforeNumber,
      lengthXBeforeNumber: this.lengthXBeforeNumber,
    };
  }
  getShape() {
    return this.shape;
  }

  getRotation() {
    return this.rotation;
  }

  getType() {
    return this.type;
  }

  rotateTetromino() {
    const newShape = [];
    for (let i = 0; i < this.shape.length; i++) {
      for (let j = 0; j < this.shape[i].length; j++) {
        if (i == 0) newShape.push([this.shape[i][j]]);
        else newShape[j].unshift(this.shape[i][j]);
      }
    }
    this.shape = newShape;
    this.rotation = (this.rotation + 90) as 0 | 90 | 180 | 270;

    if (this.rotation == 360) this.rotation = 0;
    this.setLengthTetromino();
  }

  generateRandomTetromino() {
    const randomIndex = Math.floor(Math.random() * allTetrominos.length);
    const randomTetromino = allTetrominos[randomIndex];
    this.shape = randomTetromino.shape;
    this.type = randomTetromino.type;

    const rotation = (Math.floor(Math.random() * 4) * 90) as 0 | 90 | 180 | 270;
    if (rotation == 0) {
      this.setLengthTetromino();
    }
    if (rotation == 90) {
      this.rotateTetromino();
    } else if (rotation == 180) {
      this.rotateTetromino();
      this.rotateTetromino();
    } else if (rotation == 270) {
      this.rotateTetromino();
      this.rotateTetromino();
      this.rotateTetromino();
    }
  }
  //faire une methode pour creer une piece avec un shape aleatoire
  // qui sera modifier par la rotation
}
