import { Player } from './player';
import { ManagePlayerTetromino } from '../managePlayerTetromino/managePlayerTetromino';

describe('Player', () => {
  it('should create a new player', () => {
    const player_name = 'Player 1';
    const player = new Player(player_name);
    expect(player.getPlayerName()).toBe(player_name);
    expect(player.getGrid()).toEqual(
      new Array(20).fill(null).map(() => new Array(10).fill(0)),
    );
  });
  it('should initialise a grid', () => {
    const manage = new ManagePlayerTetromino();
    const player_name = 'Player 1';
    const player_name2 = 'Player 2';
    const player = new Player(player_name);
    const player2 = new Player(player_name2);
    manage.injectTetromino(player, player2);
    player.initTetrominoInsideGrid();
    const player1_grid = player.getGrid();
    const player2_grid = player2.getGrid();

    const t = player2.getTetrominos()[0];
    const tShape = t.getShape();
    const startX = Math.floor((10 - tShape.length) / 2);
    const startY = 0;

    for (let y = 0; y < tShape.length; y++) {
      for (let x = 0; x < tShape[y].length; x++) {
        if (tShape[y][x] != 0)
          player2_grid[startY + y][startX + x] = tShape[y][x];
      }
    }

    expect(player.getPlayerName()).toBe(player_name);
    expect(player1_grid).toEqual(player2_grid);
  });
});
