import { Player } from '../player/player';
import { ManagePlayerTetromino } from './managePlayerTetromino';
import { v4 as uuidv4 } from 'uuid';

describe('ManagePlayerTetromino', () => {
  let players: Player[];

  beforeEach(() => {
    players = [];
    for (let i = 0; i < 2; i++) {
      players.push(new Player(uuidv4(), 'player' + i));
    }
  });

  describe('injectTetrominosInPlayers', () => {
    it('should inject tetrominos in players', () => {
      const managePlayerTetromino = new ManagePlayerTetromino();
      managePlayerTetromino.injectTetrominosInPlayers(players);
      expect(players[0].getTetrominos().length).toBe(1);
      expect(players[1].getTetrominos().length).toBe(1);
    });
  });

  describe('injectmultipleTetrominos', () => {
    it('should inject multiple tetrominos in players', () => {
      const managePlayerTetromino = new ManagePlayerTetromino();
      managePlayerTetromino.injectmultipleTetrominos(players, 2);
      expect(players[0].getTetrominos().length).toBe(2);
      expect(players[1].getTetrominos().length).toBe(2);
    });
  });
});
