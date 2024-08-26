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
    console.log('Piece created');
  }
  //faire une methode pour creer une piece avec un shape aleatoire
  // qui sera modifier par la rotation
}
