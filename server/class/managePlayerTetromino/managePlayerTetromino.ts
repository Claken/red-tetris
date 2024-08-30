import { Tetromino } from '../tetromino/tetromino';
import { Player } from '../player/player';

export class ManagePlayerTetromino {
  injectTetromino(player1: Player, player2: Player): void {
    const tetromino = new Tetromino();
    tetromino.generateRandomTetromino();
    const tetrominoCopie = new Tetromino(
      tetromino.getRotation(),
      tetromino.getShape(),
    );
    player1.addTeromino(tetromino);
    player2.addTeromino(tetrominoCopie);
  }
}
