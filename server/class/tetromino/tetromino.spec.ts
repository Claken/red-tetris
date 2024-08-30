import { Tetromino } from './tetromino';

const tetrominoData = [
  {
    name: 'L-shape',
    initialShape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    rotations: [
      {
        rotation: 90,
        shape: [
          [0, 1, 0],
          [0, 1, 0],
          [0, 1, 1],
        ],
      },
      {
        rotation: 180,
        shape: [
          [0, 0, 0],
          [1, 1, 1],
          [1, 0, 0],
        ],
      },
      {
        rotation: 270,
        shape: [
          [1, 1, 0],
          [0, 1, 0],
          [0, 1, 0],
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
    ],
  },
  {
    name: 'I-shape',
    initialShape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    rotations: [
      {
        rotation: 90,
        shape: [
          [0, 0, 1, 0],
          [0, 0, 1, 0],
          [0, 0, 1, 0],
          [0, 0, 1, 0],
        ],
      },
      {
        rotation: 180,
        shape: [
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
        ],
      },
      {
        rotation: 270,
        shape: [
          [0, 1, 0, 0],
          [0, 1, 0, 0],
          [0, 1, 0, 0],
          [0, 1, 0, 0],
        ],
      },
      {
        rotation: 0,
        shape: [
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
      },
    ],
  },
  {
    name: 'J-shape',
    initialShape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    rotations: [
      {
        rotation: 90,
        shape: [
          [0, 1, 1],
          [0, 1, 0],
          [0, 1, 0],
        ],
      },
      {
        rotation: 180,
        shape: [
          [0, 0, 0],
          [1, 1, 1],
          [0, 0, 1],
        ],
      },
      {
        rotation: 270,
        shape: [
          [0, 1, 0],
          [0, 1, 0],
          [1, 1, 0],
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
    ],
  },
  {
    name: 'O-shape',
    initialShape: [
      [1, 1],
      [1, 1],
    ],
    rotations: [
      {
        rotation: 90,
        shape: [
          [1, 1],
          [1, 1],
        ],
      },
      {
        rotation: 180,
        shape: [
          [1, 1],
          [1, 1],
        ],
      },
      {
        rotation: 270,
        shape: [
          [1, 1],
          [1, 1],
        ],
      },
      {
        rotation: 0,
        shape: [
          [1, 1],
          [1, 1],
        ],
      },
    ],
  },
  {
    name: 'S-shape',
    initialShape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    rotations: [
      {
        rotation: 90,
        shape: [
          [0, 1, 0],
          [0, 1, 1],
          [0, 0, 1],
        ],
      },
      {
        rotation: 180,
        shape: [
          [0, 0, 0],
          [0, 1, 1],
          [1, 1, 0],
        ],
      },
      {
        rotation: 270,
        shape: [
          [1, 0, 0],
          [1, 1, 0],
          [0, 1, 0],
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
    ],
  },
  {
    name: 'T-shape',
    initialShape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    rotations: [
      {
        rotation: 90,
        shape: [
          [0, 1, 0],
          [0, 1, 1],
          [0, 1, 0],
        ],
      },
      {
        rotation: 180,
        shape: [
          [0, 0, 0],
          [1, 1, 1],
          [0, 1, 0],
        ],
      },
      {
        rotation: 270,
        shape: [
          [0, 1, 0],
          [1, 1, 0],
          [0, 1, 0],
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
    ],
  },
  {
    name: 'Z-shape',
    initialShape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    rotations: [
      {
        rotation: 90,
        shape: [
          [0, 0, 1],
          [0, 1, 1],
          [0, 1, 0],
        ],
      },
      {
        rotation: 180,
        shape: [
          [0, 0, 0],
          [1, 1, 0],
          [0, 1, 1],
        ],
      },
      {
        rotation: 270,
        shape: [
          [0, 1, 0],
          [1, 1, 0],
          [1, 0, 0],
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
    ],
  },
];

describe('Tetromino', () => {
  it('should generate a random tetromino', () => {
    const tetromino = new Tetromino();
    tetromino.generateRandomTetromino();
    expect(tetromino).toBeDefined();
  });
  it('should rotate first tetromino', () => {
    for (let i = 0; i < tetrominoData.length; i++) {
      const t = new Tetromino(0, tetrominoData[i].initialShape);
      for (let j = 0; j < tetrominoData[i].rotations.length; j++) {
        t.rotateTetromino();
        console.log(t.getShape());
        const valTest = tetrominoData[i].rotations[j];
        expect(t.getShape()).toEqual(valTest.shape);
        expect(t.getRotation()).toEqual(valTest.rotation);
      }
    }
  });
});
