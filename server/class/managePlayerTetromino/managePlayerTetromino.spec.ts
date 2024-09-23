import { Player } from '../player/player';
import { ManagePlayerTetromino } from './managePlayerTetromino';
import { v4 as uuidv4 } from 'uuid';

describe('ManagePlayerTetromino', () => {
  it('should add at player1 same tetromino to player2', () => {
    const managePT = new ManagePlayerTetromino();
    const player1 = new Player('raph', uuidv4());
    const player2 = new Player('samy', uuidv4());
    managePT.injectTetromino(player1, player2);
    const tab1 = player1.getTetrominos();
    const tab2 = player2.getTetrominos();

    expect(tab1.length).toEqual(tab2.length);
    expect(tab1[tab1.length - 1].getShape()).toEqual(
      tab2[tab2.length - 1].getShape(),
    );
    expect(tab1[tab1.length - 1].getRotation()).toEqual(
      tab2[tab2.length - 1].getRotation(),
    );
    expect(tab1[tab1.length - 1].getType()).toEqual(
      tab2[tab2.length - 1].getType(),
    );
  });

  it('should inject multiple tetrominos', () => {
    const managePT = new ManagePlayerTetromino();
    const player1 = new Player('raph', uuidv4());
    const player2 = new Player('samy', uuidv4());
    managePT.injectmultipleTetromino(player1, player2, 10);
    const tab1 = player1.getTetrominos();
    const tab2 = player2.getTetrominos();
    expect(tab1.length).toEqual(tab2.length);
  });
});
