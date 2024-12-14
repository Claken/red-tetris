import { Tetromino } from '../tetromino/tetromino';
import { Player } from '../player/player';

export class ManagePlayerTetromino {
  // injectTetromino(player1: Player, player2: Player): void {
  //   const tetromino = new Tetromino();
  //   tetromino.generateRandomTetromino();
  //   const tetrominoCopie = new Tetromino(
  //     tetromino.getRotation(),
  //     tetromino.getShape(),
  //     tetromino.getType(),
  //   );
  //   player1.addTeromino(tetromino);
  //   player2.addTeromino(tetrominoCopie);
  // }

  // injectmultipleTetromino(player1: Player, player2: Player, num: number): void {
  //   for (let i = 0; i < num; i++) {
  //     this.injectTetromino(player1, player2);
  //   }
  // }

  injectTetrominosInPlayers(players: Player[]): void {
    const tetromino = new Tetromino();
    tetromino.generateRandomTetromino();
    for (let i = 0; i < players.length; i++) {
      if (i === 0) {
        players[i].addTeromino(tetromino);
      } else {
        const tetrominoCopie = new Tetromino(
          tetromino.getRotation(),
          tetromino.getShape(),
          tetromino.getType(),
        );
        players[i].addTeromino(tetrominoCopie);
      }
    }
  }

  // test fait

  injectmultipleTetrominos(players: Player[], num: number): void {
    for (let i = 0; i < num; i++) {
      this.injectTetrominosInPlayers(players);
    }
  }

  // test fait
}
