import { Injectable } from '@nestjs/common';
import { Tetromino } from '../class/tetromino';

@Injectable()
export class AppService {
  getHello(): string {
    const tetromino = new Tetromino();
    tetromino.generateRandomTetromino();
    return 'Hello World!';
  }
}
