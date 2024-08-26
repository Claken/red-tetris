interface InterfaceTetromino {
  rotation: 0 | 90 | 180 | 270; // rotate the piece in degrees
  shape: number[][]; // shape of the piece
}

const allTetrominos: InterfaceTetromino[] = [
  {
    rotation: 0,
    shape: [[1, 1, 1, 1]],
  },
  {
    rotation: 0,
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
  },
  {
    rotation: 0,
    shape: [
      [0, 0, 1],
      [1, 1, 1],
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
    ],
  },
  {
    rotation: 0,
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
  },
  {
    rotation: 0,
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
  },
];

export class Tetromino {
  //create private variable
  // reflechir a comment l'objet piece doit etre construit
  private tetromino: InterfaceTetromino;

  constructor() {
    console.log('tetromino created');
  }
  generateRandomTetromino() {
    const randomIndex = Math.floor(Math.random() * allTetrominos.length);
    this.tetromino = allTetrominos[randomIndex];
    this.tetromino.rotation = (Math.floor(Math.random() * 4) * 90) as
      | 0
      | 90
      | 180
      | 270;
    const newShape = [];
    console.log(this.tetromino);
    for (let i = 0; i < this.tetromino.shape.length; i++) {
      for (let j = 0; j < this.tetromino.shape[i].length; j++) {
        if (i == 0) newShape.push([this.tetromino.shape[i][j]]);
        else newShape[j].push(this.tetromino.shape[i][j]);
      }
    }
    this.tetromino.shape = newShape;
    console.log(this.tetromino);
  }
  //faire une methode pour creer une piece avec un shape aleatoire
  // qui sera modifier par la rotation
}
