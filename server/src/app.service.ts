import { Injectable } from '@nestjs/common';
// import { Player } from '../class/player/player';
// import { v4 as uuidv4 } from 'uuid';
// import { ManagePlayerTetromino } from '../class/managePlayerTetromino/managePlayerTetromino';
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
