import { Player } from './player';

describe('Player', () => {
  it('should create a new player', () => {
    const player_name = 'Player 1';
    const player = new Player(player_name);
    expect(player.getPlayerName()).toBe(player_name);
    expect(player.getGrid()).toEqual(
      new Array(20).fill(null).map(() => new Array(10).fill(0)),
    );
  });
});
