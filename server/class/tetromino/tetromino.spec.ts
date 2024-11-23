import { Tetromino } from './tetromino';
import { I, E } from '../../constantes/constantes';

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
        const valTest = tetrominoData[i].rotations[j];
        expect(t.getShape()).toEqual(valTest.shape);
        expect(t.getRotation()).toEqual(valTest.rotation);
      }
    }
  });

  describe('getLentgth()', () => {
    it('should return correct dimensions and first non-empty cell positions', () => {
      // Arrange
      const shape = [
        [E, E, E, E],
        [E, I, I, E],
        [E, E, E, E],
      ];
      const tetromino = new Tetromino(0, shape, 'I');

      // Act
      const result = tetromino.getLentgth();

      // Assert
      expect(result).toEqual({
        x: 4, // Width of the shape
        y: 3, // Height of the shape
        lengthYBeforeNumber: 1, // Row index of the first non-empty cell
        lengthXBeforeNumber: 1, // Column index of the first non-empty cell
      });
    });

    it('should return zeros for empty shape', () => {
      // Arrange
      const tetromino = new Tetromino();

      // Act
      const result = tetromino.getLentgth();

      // Assert
      expect(result).toEqual({
        x: 0,
        y: 0,
        lengthYBeforeNumber: 0,
        lengthXBeforeNumber: 0,
      });
    });
  });
  describe('getShape()', () => {
    it('should return the current shape of the Tetromino', () => {
      // Arrange
      const shape = [
        [E, E, E],
        [E, I, E],
        [E, E, E],
      ];
      const tetromino = new Tetromino(0, shape, 'I');

      // Act
      const result = tetromino.getShape();

      // Assert
      expect(result).toEqual(shape);
    });
  });

  describe('getRotation()', () => {
    it('should return the current rotation of the Tetromino', () => {
      // Arrange
      const rotation = 90;
      const tetromino = new Tetromino(rotation, [], 'I');

      // Act
      const result = tetromino.getRotation();

      // Assert
      expect(result).toBe(rotation);
    });
  });

  describe('getType()', () => {
    it('should return the type of the Tetromino', () => {
      // Arrange
      const type = 'I';
      const tetromino = new Tetromino(0, [], type);

      // Act
      const result = tetromino.getType();

      // Assert
      expect(result).toBe(type);
    });
  });
});
