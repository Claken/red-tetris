import { Player } from './player';
import { Tetromino } from '../tetromino/tetromino';
import { ManagePlayerTetromino } from '../managePlayerTetromino/managePlayerTetromino';
import { v4 as uuidv4 } from 'uuid';
import {
  E,
  B,
  I,
  SPECTRUM,
  UNBREAKABLE_BRICK,
} from '../../constantes/constantes';

describe('Player', () => {
  let player: Player;
  let tetromino: Tetromino;
  let grid: number[][];
  let spectrum: number[][];
  let tetrominos: Tetromino[];

  const print2DArray = (arr: any) => {
    console.log('[');
    for (let i = 0; i < arr.length; i++) {
      console.log('  [' + arr[i].join(',') + ']');
    }
    console.log(']');
  };

  beforeEach(() => {
    // Créer un joueur avec un nom et un UUID
    player = new Player('TestPlayer', '1234-uuid');
    grid = new Array(24).fill(null).map(() => new Array(10).fill(E));
    spectrum = new Array(24).fill(null).map(() => new Array(10).fill(E));
    // Créer un Tetromino de test (en supposant que tu aies une méthode pour ça)
    tetromino = new Tetromino(
      0,
      [
        [E, E, E, E],
        [I, I, I, I],
        [E, E, E, E],
        [E, E, E, E],
      ],
      'I',
    );
    player.addTeromino(tetromino); // Ajouter un tetromino au joueur
  });

  describe('getToken', () => {
    it('should return the token', () => {
      expect(player.getToken()).toBe(0);
    });
  });
  describe('getPlayerName', () => {
    it('should return the player name', () => {
      expect(player.getPlayerName()).toBe('TestPlayer');
    });
  });
  describe('getUuid', () => {
    it('should return the player UUID', () => {
      expect(player.getUuid()).toBe('1234-uuid');
    });
  });
  describe('getGrid', () => {
    it('should return the player grid', () => {
      expect(player.getGrid()).toEqual(grid);
    });
  });
  describe('getSpectrum', () => {
    it('should return the player spectrum', () => {
      expect(player.getSpectrum()).toEqual(spectrum);
    });
  });
  describe('getTetrominos', () => {
    it('should return the player tetrominos', () => {
      const tetromino = player.getTetrominos()[0];
      expect(tetromino.getType()).toEqual('I');
      expect(tetromino.getShape()).toEqual([
        [E, E, E, E],
        [I, I, I, I],
        [E, E, E, E],
        [E, E, E, E],
      ]);
      expect(tetromino.getRotation()).toEqual(0);
    });
  });
  describe('getIsMaster', () => {
    it('should return the player isMaster', () => {
      expect(player.getIsMaster()).toBe(false);
    });
  });
  describe('setIsMaster', () => {
    it('should set the player isMaster', () => {
      player.setIsMaster(true);
      expect(player.getIsMaster()).toBe(true);
    });
  });
  describe('addTeromino', () => {
    it('should add a tetromino to the player', () => {
      const tetromino = new Tetromino(
        0,
        [
          [E, E, E, E],
          [I, I, I, I],
          [E, E, E, E],
          [E, E, E, E],
        ],
        'I',
      );
      player.addTeromino(tetromino);
      expect(player.getTetrominos().length).toBe(2);
    });
  });
  describe('setGridToZero', () => {
    it('should set the player grid to zero', () => {
      player.setGridToZero();
      expect(player.getGrid()).toEqual(
        new Array(24).fill(null).map(() => new Array(10).fill(0)),
      );
    });
  });
  describe('setTetrominosToZero', () => {
    it('should set the player tetrominos to zero', () => {
      player.setTetrominosToZero();
      expect(player.getTetrominos()).toEqual([]);
    });
  });
  describe('setToken', () => {
    it('should set the player token', () => {
      player.setToken(1);
      expect(player.getToken()).toBe(1);
    });
  });

  describe('initTetrominosInsideGrid', () => {
    it('should init the tetrominos inside the grid', () => {
      player.initTetrominoInsideGrid();
      grid[4][3] = I;
      grid[4][4] = I;
      grid[4][5] = I;
      grid[4][6] = I;

      grid[23][3] = SPECTRUM;
      grid[23][4] = SPECTRUM;
      grid[23][5] = SPECTRUM;
      grid[23][6] = SPECTRUM;
      expect(player.getGrid()).toEqual(grid);
    });
  });

  describe('action', () => {
    it('should return the player action', () => {
      grid[4][3] = I;
      grid[4][4] = I;
      grid[4][5] = I;
      grid[4][6] = I;

      grid[23][3] = SPECTRUM;
      grid[23][4] = SPECTRUM;
      grid[23][5] = SPECTRUM;
      grid[23][6] = SPECTRUM;
      player.initTetrominoInsideGrid();
      player.action('left');
      grid[4][2] = I;
      grid[4][6] = E;

      grid[23][2] = SPECTRUM;
      grid[23][6] = E;
      expect(player.getGrid()).toEqual(grid);
      player.action('right');
      grid[4][2] = E;
      grid[4][6] = I;

      grid[23][2] = E;
      grid[23][6] = SPECTRUM;
      expect(player.getGrid()).toEqual(grid);
      player.action('down');
      grid[4][3] = E;
      grid[4][4] = E;
      grid[4][5] = E;
      grid[4][6] = E;
      grid[5][3] = I;
      grid[5][4] = I;
      grid[5][5] = I;
      grid[5][6] = I;
      expect(player.getGrid()).toEqual(grid);
      player.action('up');
      grid[5][3] = E;
      grid[5][4] = E;
      grid[5][6] = E;
      grid[4][5] = I;
      grid[6][5] = I;
      grid[7][5] = I;

      grid[23][3] = E;
      grid[23][4] = E;
      grid[23][6] = E;
      grid[22][5] = SPECTRUM;
      grid[21][5] = SPECTRUM;
      grid[20][5] = SPECTRUM;
      expect(player.getGrid()).toEqual(grid);
    });
  });

  describe('isPartOfTetromino', () => {
    it('should return if the player is part of a tetromino', () => {
      player.initTetrominoInsideGrid();
      expect((player as any).isPartOfTetromino(I)).toBe(true);
      expect((player as any).isPartOfTetromino(0)).toBe(false);
    });
  });

  describe('checkIfBrick', () => {
    it('should return if there is a brick', () => {
      player.initTetrominoInsideGrid();
      expect(player.checkIfBrick(0)).toBe(false);
      expect(player.checkIfBrick(5)).toBe(true);
    });
  });

  describe('fallSpectrum', () => {
    it('should be the same', () => {
      player.initTetrominoInsideGrid();
      player.fallSpectrum();
      grid[4][3] = I;
      grid[4][4] = I;
      grid[4][5] = I;
      grid[4][6] = I;

      grid[23][3] = SPECTRUM;
      grid[23][4] = SPECTRUM;
      grid[23][5] = SPECTRUM;
      grid[23][6] = SPECTRUM;
      expect(player.getGrid()).toEqual(grid);
    });
    it('should fail', () => {
      player.initTetrominoInsideGrid();
      player.fallSpectrum();
      grid[4][3] = I;
      grid[4][4] = I;
      grid[4][5] = I;
      grid[4][6] = I;

      grid[22][3] = SPECTRUM;
      grid[22][4] = SPECTRUM;
      grid[22][5] = SPECTRUM;
      grid[22][6] = SPECTRUM;
      expect(player.getGrid()).not.toEqual(grid);
    });
  });

  describe('fallTetromino', () => {
    it('should be the same', () => {
      const tetromino2 = new Tetromino(
        0,
        [
          [E, E, E, E],
          [I, I, I, I],
          [E, E, E, E],
          [E, E, E, E],
        ],
        'I',
      );
      player.addTeromino(tetromino2);

      player.initTetrominoInsideGrid();
      player.fallTetromino();
      grid[23][3] = B;
      grid[23][4] = B;
      grid[23][5] = B;
      grid[23][6] = B;

      grid[22][3] = SPECTRUM;
      grid[22][4] = SPECTRUM;
      grid[22][5] = SPECTRUM;
      grid[22][6] = SPECTRUM;

      grid[4][3] = I;
      grid[4][4] = I;
      grid[4][5] = I;
      grid[4][6] = I;

      expect(player.getGrid()).toEqual(grid);
    });
  });

  describe('moveDownTetromino', () => {
    it('should move the tetromino down one step', () => {
      player.initTetrominoInsideGrid();
      player.moveDownTetromino();
      grid[5][3] = I;
      grid[5][4] = I;
      grid[5][5] = I;
      grid[5][6] = I;
      grid[23][3] = SPECTRUM;
      grid[23][4] = SPECTRUM;
      grid[23][5] = SPECTRUM;
      grid[23][6] = SPECTRUM;
      expect(player.getGrid()).toEqual(grid);
    });
  });

  describe('moveLeftTetromino', () => {
    it('should move the tetromino left one step', () => {
      player.initTetrominoInsideGrid();
      player.moveLeftTetromino();
      grid[4][2] = I;
      grid[4][3] = I;
      grid[4][4] = I;
      grid[4][5] = I;
      grid[23][2] = SPECTRUM;
      grid[23][3] = SPECTRUM;
      grid[23][4] = SPECTRUM;
      grid[23][5] = SPECTRUM;
      expect(player.getGrid()).toEqual(grid);
    });
  });

  describe('moveRightTetromino', () => {
    it('should move the tetromino right one step', () => {
      player.initTetrominoInsideGrid();
      player.moveRightTetromino();
      grid[4][4] = I;
      grid[4][5] = I;
      grid[4][6] = I;
      grid[4][7] = I;
      grid[23][4] = SPECTRUM;
      grid[23][5] = SPECTRUM;
      grid[23][6] = SPECTRUM;
      grid[23][7] = SPECTRUM;
      expect(player.getGrid()).toEqual(grid);
    });
  });

  describe('rotateTetromino', () => {
    it('should rotate the tetromino', () => {
      player.initTetrominoInsideGrid();
      player.rotateTetromino();
      grid[3][5] = I;
      grid[4][5] = I;
      grid[5][5] = I;
      grid[6][5] = I;
      grid[23][5] = SPECTRUM;
      grid[22][5] = SPECTRUM;
      grid[21][5] = SPECTRUM;
      grid[20][5] = SPECTRUM;
      expect(player.getGrid()).toEqual(grid);
    });
  });

  describe('isColisionRotate', () => {
    it('should return if there is a colision with the tetromino', () => {
      player.initTetrominoInsideGrid();
      const lengthTetro = player.getTetrominos()[0].getLentgth();
      player.getTetrominos()[0].rotateTetromino();
      const grid = player.getGrid();
      const shape = player.getTetrominos()[0].getShape();
      let startX = 0;
      let startY = 0;
      let endX = 0;
      let endY = 0;
      for (let y = 0; y < grid.length; y++) {
        for (let x = 0; grid[y].length > x; x++) {
          if ((player as any).isPartOfTetromino(grid[y][x])) {
            startX = x - lengthTetro.lengthXBeforeNumber;
            startY = y - lengthTetro.lengthYBeforeNumber;
            endX = startX + lengthTetro.x;
            endY = startY + lengthTetro.y;
            y = grid.length - 1;
            x = grid[y].length;
          }
        }
      }
      expect(player.isColisionRotate({ startY, startX, endY, endX })).toBe(
        false,
      );
    });
  });

  describe('isCollisionMove', () => {
    it('should return if there is a colision with the tetromino', () => {
      player.initTetrominoInsideGrid();
      expect(player.isCollisionMove(1, 0)).toBe(false);
    });
  });

  describe('isPlayerLost', () => {
    it('should return if the player lost', () => {
      player.initTetrominoInsideGrid();
      expect(player.isPlayerLost()).toBe(false);
    });
  });

  describe('cleaLines', () => {
    it('should clear the lines and return the number of lines destroy', () => {
      for (let i = 0; i < 10; i++) {
        let tetromino2 = new Tetromino(
          0,
          [
            [E, E, E, E],
            [I, I, I, I],
            [E, E, E, E],
            [E, E, E, E],
          ],
          'I',
        );
        player.addTeromino(tetromino2);
      }
      player.initTetrominoInsideGrid();
      player.moveLeftTetromino();
      player.moveLeftTetromino();
      player.moveLeftTetromino();
      player.fallTetromino();
      player.moveRightTetromino();
      player.fallTetromino();
      player.rotateTetromino();
      player.moveRightTetromino();
      player.moveRightTetromino();
      player.moveRightTetromino();
      player.fallTetromino();
      player.rotateTetromino();
      player.moveRightTetromino();
      player.moveRightTetromino();
      player.moveRightTetromino();
      player.moveRightTetromino();
      player.fallTetromino(1);
      const grid = player.getGrid();
      grid[23][9] = B;
      grid[22][9] = B;
      grid[21][9] = B;
      grid[20][9] = B;
      expect(player.clearLines()).toBe(1);
    });
  });

  describe('updateGrid', () => {
    it('should update the grid', () => {
      for (let i = 0; i < 10; i++) {
        let tetromino2 = new Tetromino(
          0,
          [
            [E, E, E, E],
            [I, I, I, I],
            [E, E, E, E],
            [E, E, E, E],
          ],
          'I',
        );
        player.addTeromino(tetromino2);
      }
      player.initTetrominoInsideGrid();
      player.fallTetromino(1);
      player.updateGrid(0);
      grid[4][3] = I;
      grid[4][4] = I;
      grid[4][5] = I;
      grid[4][6] = I;

      grid[22][3] = SPECTRUM;
      grid[22][4] = SPECTRUM;
      grid[22][5] = SPECTRUM;
      grid[22][6] = SPECTRUM;
      grid[23][3] = B;
      grid[23][4] = B;
      grid[23][5] = B;
      grid[23][6] = B;
      expect(player.getGrid()).toEqual(grid);
    });
  });

  describe('addLine', () => {
    it('should add a line to the grid', () => {
      player.initTetrominoInsideGrid();
      player.addLine(1);
      grid[3][3] = I;
      grid[3][4] = I;
      grid[3][5] = I;
      grid[3][6] = I;

      grid[22][3] = SPECTRUM;
      grid[22][4] = SPECTRUM;
      grid[22][5] = SPECTRUM;
      grid[22][6] = SPECTRUM;

      grid[23][0] = UNBREAKABLE_BRICK;
      grid[23][1] = UNBREAKABLE_BRICK;
      grid[23][2] = UNBREAKABLE_BRICK;
      grid[23][3] = UNBREAKABLE_BRICK;
      grid[23][4] = UNBREAKABLE_BRICK;
      grid[23][5] = UNBREAKABLE_BRICK;
      grid[23][6] = UNBREAKABLE_BRICK;
      grid[23][7] = UNBREAKABLE_BRICK;
      grid[23][8] = UNBREAKABLE_BRICK;
      grid[23][9] = UNBREAKABLE_BRICK;

      expect(player.getGrid()).toEqual(grid);
    });
  });

  describe('updateSpectrum', () => {
    it('should update the spectrum', () => {
      for (let i = 0; i < 10; i++) {
        let tetromino2 = new Tetromino(
          0,
          [
            [E, E, E, E],
            [I, I, I, I],
            [E, E, E, E],
            [E, E, E, E],
          ],
          'I',
        );
        player.addTeromino(tetromino2);
      }
      player.initTetrominoInsideGrid();
      player.fallTetromino();
      player.updateSpectrum();
      spectrum[23][3] = B;
      spectrum[23][4] = B;
      spectrum[23][5] = B;
      spectrum[23][6] = B;
      expect(player.getSpectrum()).toEqual(spectrum);
    });
  });
});
