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

  it('should fall tetromino in a grid', () => {
    const manage = new ManagePlayerTetromino();
    const player_name = 'Player 1';
    const player_name2 = 'Player 2';
    const player = new Player(player_name);
    const player2 = new Player(player_name2);
    manage.injectTetromino(player, player2);
    player.initTetrominoInsideGrid();
    player.fallTetromino();
    const t = player2.getTetrominos()[0];
    const tShape = t.getShape();
    const startX = Math.floor((10 - tShape.length) / 2);
    const startY = 20 - tShape.length;
    const grid2 = player2.getGrid();

    for (let y = 0; y < tShape.length; y++) {
      for (let x = 0; x < tShape[y].length; x++) {
        if (tShape[y][x] != 0) grid2[startY + y][startX + x] = tShape[y][x];
      }
    }
    while (grid2[19].some((value) => value == 1) == false) {
      for (let y = grid2.length - 1; y > 0; y--) {
        for (let x = 0; x < grid2[y].length; x++) {
          if (grid2[y - 1][x] == 1) {
            grid2[y][x] = 1;
            grid2[y - 1][x] = 0;
          }
        }
      }
    }
    expect(player.getGrid()).toEqual(grid2);
  });

  it('should transform tetromino 1 to 2 in a grid', () => {
    const manage = new ManagePlayerTetromino();
    const player_name = 'Player 1';
    const player_name2 = 'Player 2';
    const player = new Player(player_name);
    const player2 = new Player(player_name2);
    manage.injectTetromino(player, player2);
    player.initTetrominoInsideGrid();
    player2.initTetrominoInsideGrid();
    player.fallTetromino();
    player2.fallTetromino();
    player.updateGrid();
    const grid2 = player2.getGrid();
    for (let y = 0; y < grid2.length; y++) {
      for (let x = 0; x < grid2[y].length; x++) {
        if (grid2[y][x] == 1) grid2[y][x] = 2;
      }
    }
    expect(player.getGrid()).toEqual(grid2);
  });
  it('should update tetromino in a grid', () => {
    const manage = new ManagePlayerTetromino();
    const player_name = 'Player 1';
    const player_name2 = 'Player 2';
    const player = new Player(player_name);
    const player2 = new Player(player_name2);
    manage.injectTetromino(player, player2);
    player.testgrid(2);
    player.updateGrid();
    const grid2 = player2.getGrid();
    for (let y = 0; y < grid2.length; y++) {
      for (let x = 0; x < grid2[y].length; x++) {
        if (y == 19 && x % 2 == 0) grid2[y][x] = 2;
      }
    }
    expect(player.getGrid()).toEqual(grid2);
  });
});

it('should check colision tetromino in a grid moove', () => {
  const manage = new ManagePlayerTetromino();
  const player_name = 'Player 1';
  const player_name2 = 'Player 2';
  const player = new Player(player_name);
  const player2 = new Player(player_name2);
  manage.injectmultipleTetromino(player, player2, 10);
  player.initTetrominoInsideGrid();
  player2.initTetrominoInsideGrid();
  player.fallTetromino();
  player2.fallTetromino();
  player.updateGrid();
  player2.updateGrid();
  player.moveDownTetromino();
  player.fallTetromino();
  expect(player.getGrid()).toEqual(player2.getGrid());
});

it('should check colision tetromino in a grid rotate', () => {
  const manage = new ManagePlayerTetromino();
  const player_name = 'Player 1';
  const player_name2 = 'Player 2';
  const player = new Player(player_name);
  const player2 = new Player(player_name2);
  manage.injectmultipleTetromino(player, player2, 10);
  player.initTetrominoInsideGrid();
  player2.initTetrominoInsideGrid();
  player.fallTetromino();
  player2.fallTetromino();
  for (let i = 0; i < 12; i++) {
    player.moveRightTetromino();
    player2.moveRightTetromino();
  }
  if (player.getTetrominos()[0].getType() == 'I') {
    const lengthTetro = player.getTetrominos()[0].getLentgth();
    const grid = player.getGrid();
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; grid[y].length > x; x++) {
        if (grid[y][x] == 1) {
          startX = x - lengthTetro.lengthXBeforeNumber;
          startY = y - lengthTetro.lengthYBeforeNumber;
          endX = startX + lengthTetro.x;
          endY = startY + lengthTetro.y;
          y = grid.length - 1;
          x = grid[y].length;
        }
      }
    }
    expect(player.isColisionRotate({ startY, startX, endY, endX })).toBe(true);
  }
  expect(player.getGrid()).toEqual(player2.getGrid());
});
