import { Player } from './player';
import { Tetromino } from '../tetromino/tetromino';
import { ManagePlayerTetromino } from '../managePlayerTetromino/managePlayerTetromino';
import { v4 as uuidv4 } from 'uuid';
import { E, B, I, SPECTRUM } from '../../constantes/constantes';

describe('Player', () => {
  let player: Player;
  let tetromino: Tetromino;
  let grid: number[][];
  let spectrum: number[][];
  let tetrominos: Tetromino[];

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
});
