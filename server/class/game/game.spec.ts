import { Server } from 'socket.io';
import { Game } from '../game/game';
import { Player } from '../player/player';

describe('Game Class', () => {
  let serverMock: jest.Mocked<Server>;
  let playersMock: Player[];
  const roomId = 'test-room-id';
  const gameType = 1; // Exemple : MULTI ou SINGLE

  beforeEach(() => {
    // Mock du serveur Socket.IO
    serverMock = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    } as unknown as jest.Mocked<Server>;

    // Mock des joueurs
    playersMock = [
      new Player('player1', 'uuid1'),
      new Player('player2', 'uuid2'),
    ];
  });

  it('should create a Game instance', () => {
    const game = new Game(playersMock, roomId, gameType, serverMock);

    expect(game).toBeInstanceOf(Game);
    expect(game.getRoomId()).toBe(roomId);
    expect(game.getType()).toBe(gameType);
    expect(game.getPlayers()).toEqual(playersMock);
    expect(game.getIsStarted()).toBe(false);
    expect(game.get_waitingPlayers()).toHaveLength(0);
    expect(game.get_lostPlayers()).toHaveLength(0);
  });

  describe('setIsStarted', () => {
    it('should set isStarted to true', () => {
      const game = new Game(playersMock, roomId, gameType, serverMock);
      game.setIsStarted(true);

      expect(game.getIsStarted()).toBe(true);
    });
  });

  describe('removeLostPlayer', () => {
    it('should remove a lost player', () => {
      const game = new Game(playersMock, roomId, gameType, serverMock);
      const lostPlayers = game.get_lostPlayers();
      lostPlayers.push(playersMock[0]);
      lostPlayers.push(playersMock[1]);
      game.removeLostPlayer(playersMock[1].getUuid());

      expect(game.get_lostPlayers()).toHaveLength(1);
      expect(game.get_lostPlayers()).toContain(playersMock[0]);
    });
  });

  describe('removePlayer', () => {
    it('should remove a player', () => {
      const game = new Game(playersMock, roomId, gameType, serverMock);
      game.removePlayer(playersMock[0].getUuid());

      expect(game.getPlayers()).toHaveLength(1);
      expect(game.getPlayers()).toContain(playersMock[1]);
    });
  });

  describe('addWaitingPlayer', () => {
    it('should add a waiting player', () => {
      const game = new Game(playersMock, roomId, gameType, serverMock);
      game.addWaitingPlayer(playersMock[0]);

      expect(game.get_waitingPlayers()).toHaveLength(1);
      expect(game.get_waitingPlayers()).toContain(playersMock[0]);
    });
  });
});
