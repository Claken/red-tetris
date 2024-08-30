interface InterfaceTetromino {
  rotation: number; // rotate the piece in degrees
  shape: number[][]; // shape of the piece
}

export const allTetrominos: InterfaceTetromino[] = [
  {
    rotation: 0,
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  {
    rotation: 0,
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  {
    rotation: 0,
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  {
    rotation: 0,
    shape: [
      [1, 1],
      [1, 1],
    ],
  },
  {
    rotation: 0,
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
  },
  {
    rotation: 0,
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  {
    rotation: 0,
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
  },
];

export class Tetromino {
  //create private variable
  // reflechir a comment l'objet piece doit etre construit
  // private tetromino: InterfaceTetromino;
  private rotation: number;
  private shape: number[][];

  constructor(rotation: number = 0, shape: number[][] = []) {
    this.rotation = rotation as 0 | 90 | 180 | 270;
    this.shape = shape;
    console.log('tetromino created');
  }

  getShape() {
    return this.shape;
  }

  getRotation() {
    return this.rotation;
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
  }

  generateRandomTetromino() {
    const randomIndex = Math.floor(Math.random() * allTetrominos.length);
    const randomTetromino = allTetrominos[randomIndex];
    this.shape = randomTetromino.shape;
    const rotation = (Math.floor(Math.random() * 4) * 90) as 0 | 90 | 180 | 270;
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
