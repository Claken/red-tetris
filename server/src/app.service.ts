import { Injectable } from '@nestjs/common';
import { Player } from '../class/player/player';
import { ManagePlayerTetromino } from '../class/managePlayerTetromino/managePlayerTetromino';
@Injectable()
export class AppService {
  getHello(): string {
    const manage = new ManagePlayerTetromino();
    const player1 = new Player('raphael');
    const player2 = new Player('samy');

    const print2DArray = (arr: any) => {
      console.log('[');
      for (let i = 0; i < arr.length; i++) {
        console.log('  [' + arr[i].join(',') + ']');
      }
      console.log(']');
    };

    manage.injectTetromino(player1, player2);
    player1.initTetrominoInsideGrid();
    print2DArray(player1.getGrid());
    player1.moveRightTetromino();
    print2DArray(player1.getGrid());
    player1.fallTetromino();
    print2DArray(player1.getGrid());
    // player1.moveDownTetromino();
    // print2DArray(player1.getGrid());
    // player1.moveLeftTetromino();
    // print2DArray(player1.getGrid());
    // player1.moveRightTetromino();
    // print2DArray(player1.getGrid());
    return 'Hello World!';
  }
}
