import { Injectable } from '@nestjs/common';
import { Player } from '../class/player/player';
import { v4 as uuidv4 } from 'uuid';
import { ManagePlayerTetromino } from '../class/managePlayerTetromino/managePlayerTetromino';
@Injectable()
export class AppService {
  getHello(): string {
    const manage = new ManagePlayerTetromino();
    const player1 = new Player('raphael', uuidv4());
    const player2 = new Player('samy', uuidv4());

    const print2DArray = (arr: any) => {
      console.log('[');
      for (let i = 0; i < arr.length; i++) {
        console.log('  [' + arr[i].join(',') + ']');
      }
      console.log(']');
    };

    manage.injectmultipleTetromino(player1, player2, 100);
    while (player1.getGrid()[3].some((elem) => elem == 2) == false) {
      player1.initTetrominoInsideGrid();
      player1.fallTetromino();
      // player1.updateGrid();
    }
    console.log(player1.isPlayerLost());
    print2DArray(player1.getGrid());

    // manage.injectTetromino(player1, player2);
    // player1.initTetrominoInsideGrid();
    // // print2DArray(player1.getGrid());
    // // player1.testgrid(2);
    // print2DArray(player1.getGrid());
    // player1.fallTetromino();
    // print2DArray(player1.getGrid());
    // for (let i = 0; i < 20; i++) {
    //   player1.moveRightTetromino();
    // }
    // print2DArray(player1.getGrid());
    // player1.rotateTetromino();
    // print2DArray(player1.getGrid());
    // console.log(player1.getTetrominos()[0].getType());
    // player1.updateGrid();
    // print2DArray(player1.getGrid());
    // player1.moveDownTetromino();
    // print2DArray(player1.getGrid());
    // player1.fallTetromino();
    // const tetromino1 = player1.getTetrominos()[0];
    // print2DArray(player1.getGrid());
    // player1.rotateTetromino();
    // print2DArray(player1.getGrid());
    // console.log('--------------------');
    // console.log(tetromino1.getType());
    // player1.moveRightTetromino();
    // print2DArray(player1.getGrid());
    // player1.fallTetromino();
    // print2DArray(player1.getGrid());
    // player1.updateGrid();
    // print2DArray(player1.getGrid());
    // player1.moveDownTetromino();
    // print2DArray(player1.getGrid());
    // player1.moveLeftTetromino();
    // print2DArray(player1.getGrid());
    // player1.moveRightTetromino();
    // print2DArray(player1.getGrid());
    return 'Hello World!';
  }
}
