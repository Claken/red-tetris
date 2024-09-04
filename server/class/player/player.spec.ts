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

  it('should moveDown moveLeft MoveRight tetromino in a grid', () => {
    const manage = new ManagePlayerTetromino();
    const player_name = 'Player 1';
    const player_name2 = 'Player 2';
    const player = new Player(player_name);
    const player2 = new Player(player_name2);
    manage.injectTetromino(player, player2);
    player.initTetrominoInsideGrid();
    player.moveDownTetromino();
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

    for (let y = player2_grid.length - 1; y > 0; y--) {
      for (let x = 0; x < player2_grid[y].length; x++) {
        if (player2_grid[y - 1][x] == 1) {
          player2_grid[y][x] = 1;
          player2_grid[y - 1][x] = 0;
        }
      }
    }

    expect(player.getPlayerName()).toBe(player_name);
    expect(player1_grid).toEqual(player2_grid);

    player.moveLeftTetromino();

    for (let y = 0; y < player2_grid.length; y++) {
      for (let x = 0; player2_grid[y].length > x; x++) {
        if (player2_grid[y][x] == 1) {
          player2_grid[y][x - 1] = 1;
          player2_grid[y][x] = 0;
        }
      }
    }
    expect(player1_grid).toEqual(player2_grid);

    player.moveRightTetromino();
    for (let y = 0; y < player2_grid.length; y++) {
      for (let x = player2_grid[y].length - 1; x > 0; x--) {
        if (player2_grid[y][x - 1] == 1) {
          player2_grid[y][x] = 1;
          player2_grid[y][x - 1] = 0;
        }
      }
    }
    expect(player1_grid).toEqual(player2_grid);
  });

  it('should rotate tetromino in a grid', () => {
    const manage = new ManagePlayerTetromino();
    const player_name = 'Player 1';
    const player_name2 = 'Player 2';
    const player = new Player(player_name);
    const player2 = new Player(player_name2);
    manage.injectTetromino(player, player2);
    player.initTetrominoInsideGrid();
    player.rotateTetromino();
    player2.getTetrominos()[0].rotateTetromino();
    player2.initTetrominoInsideGrid();
    const player1_grid = player.getGrid();
    const player2_grid = player2.getGrid();
    expect(player1_grid).toEqual(player2_grid);
  });
});
