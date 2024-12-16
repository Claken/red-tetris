import { Server } from 'socket.io';
import { Game } from '../game/game';
import { Player } from '../player/player';
import { ManagePlayerTetromino } from '../managePlayerTetromino/managePlayerTetromino';
import { ClientInfo } from '../../interfaces/clientInfo';
import { Tetromino } from '../tetromino/tetromino';
import { MULTI, SINGLE } from '../../constantes/constantes';

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

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
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

  describe('changePlayerToWaiting', () => {
    it('should change a player to waiting', () => {
      const game = new Game(playersMock, roomId, gameType, serverMock);
      game.changePlayerToWaiting(playersMock[0].getUuid());
      expect(game.get_waitingPlayers()).toHaveLength(1);
      expect(game.get_waitingPlayers()).toContain(playersMock[0]);
    });
  });

  describe('moveRight', () => {
    it('should move the player to the right', () => {
      const serverMock = {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      } as unknown as jest.Mocked<Server>;
      const playersMock = [
        new Player('player1', 'uuid1'),
        new Player('player2', 'uuid2'),
      ];
      jest
        .spyOn(playersMock[0], 'moveRightTetromino')
        .mockImplementation(() => {});
      const game = new Game(playersMock, 'test-room-id', 1, serverMock);
      game.moveRight('uuid1', ['socketId1']);
      expect(playersMock[0].moveRightTetromino).toHaveBeenCalled();
    });
  });

  describe('moveLeft', () => {
    it('should move the player to the left', () => {
      const serverMock = {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      } as unknown as jest.Mocked<Server>;
      const playersMock = [
        new Player('player1', 'uuid1'),
        new Player('player2', 'uuid2'),
      ];
      jest
        .spyOn(playersMock[0], 'moveLeftTetromino')
        .mockImplementation(() => {});
      const game = new Game(playersMock, 'test-room-id', 1, serverMock);
      game.moveLeft('uuid1', ['socketId1']);
      expect(playersMock[0].moveLeftTetromino).toHaveBeenCalled();
    });
  });

  describe('rotate', () => {
    it('should rotate the player', () => {
      const serverMock = {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      } as unknown as jest.Mocked<Server>;
      const playersMock = [
        new Player('player1', 'uuid1'),
        new Player('player2', 'uuid2'),
      ];
      jest
        .spyOn(playersMock[0], 'rotateTetromino')
        .mockImplementation(() => {});
      const game = new Game(playersMock, 'test-room-id', 1, serverMock);
      game.rotate('uuid1', ['socketId1']);
      expect(playersMock[0].rotateTetromino).toHaveBeenCalled();
    });
  });

  describe('moveDown', () => {
    it('should move the player down', () => {
      const serverMock = {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      } as unknown as jest.Mocked<Server>;
      const playersMock = [
        new Player('player1', 'uuid1'),
        new Player('player2', 'uuid2'),
      ];
      jest
        .spyOn(playersMock[0], 'moveDownTetromino')
        .mockImplementation(() => {});
      const game = new Game(playersMock, 'test-room-id', 1, serverMock);
      game.moveDown('uuid1', ['socketId1']);
      expect(playersMock[0].moveDownTetromino).toHaveBeenCalled();
    });
  });

  describe('fallDown', () => {
    it('should make the player fall down', () => {
      const serverMock = {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      } as unknown as jest.Mocked<Server>;
      const playersMock = [
        new Player('player1', 'uuid1'),
        new Player('player2', 'uuid2'),
      ];
      jest.spyOn(playersMock[0], 'fallTetromino').mockImplementation(() => {});
      const game = new Game(playersMock, 'test-room-id', 1, serverMock);
      game.fallDown('uuid1', ['socketId1']);
      expect(playersMock[0].fallTetromino).toHaveBeenCalled();
    });
  });

  describe('startGame', () => {
    it('should start the game and initialize players with tetrominos', async () => {
      const serverMock = {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      } as unknown as jest.Mocked<Server>;

      const playersMock = [
        new Player('player1', 'uuid1'),
        new Player('player2', 'uuid2'),
      ];

      const setIsStartedMock = jest
        .spyOn(Game.prototype, 'setIsStarted')
        .mockImplementation();
      const sendCounterToClientMock = jest
        .spyOn(Game.prototype, 'sendCounterToClient')
        .mockResolvedValue();
      const sendGameToClientMock = jest
        .spyOn(Game.prototype, 'sendGameToClient')
        .mockImplementation();

      playersMock.forEach((player) => {
        jest.spyOn(player, 'initTetrominoInsideGrid').mockImplementation();
        jest.spyOn(player, 'addTetromino').mockImplementation();
        jest.spyOn(player, 'getTetrominos').mockReturnValue([]);
      });

      jest
        .spyOn(ManagePlayerTetromino.prototype, 'injectmultipleTetrominos')
        .mockImplementation((players, num) => {
          for (let i = 0; i < num; i++) {
            players.forEach((player) => {
              // Crée un mock d'objet Tetromino
              const mockTetromino: Tetromino = {
                getRotation: jest.fn().mockReturnValue(0),
                getShape: jest.fn().mockReturnValue([[1]]),
                getType: jest.fn().mockReturnValue('mock'),
              } as unknown as Tetromino;

              player.addTetromino(mockTetromino);
            });
          }
        });

      const game = new Game(playersMock, roomId, gameType, serverMock);

      const UUIDMapings = new Map<string, ClientInfo>();
      UUIDMapings.set('uuid1', {
        socketsId: ['socketId1'],
        ownedRoomsId: ['room1'],
        otherRoomsId: [],
        name: 'player1',
      });
      UUIDMapings.set('uuid2', {
        socketsId: ['socketId2'],
        ownedRoomsId: [],
        otherRoomsId: ['room1'],
        name: 'player2',
      });
      await game.startGame(UUIDMapings);

      expect(setIsStartedMock).toHaveBeenCalledWith(true);

      expect(sendCounterToClientMock).toHaveBeenCalledTimes(playersMock.length);
      expect(sendCounterToClientMock).toHaveBeenCalledWith(playersMock[0], [
        'socketId1',
      ]);
      expect(sendCounterToClientMock).toHaveBeenCalledWith(playersMock[1], [
        'socketId2',
      ]);

      expect(
        ManagePlayerTetromino.prototype.injectmultipleTetrominos,
      ).toHaveBeenCalledWith(playersMock, 100);

      playersMock.forEach((player) => {
        expect(player.initTetrominoInsideGrid).toHaveBeenCalled();
      });
      expect(sendGameToClientMock).toHaveBeenCalledTimes(playersMock.length);
      expect(sendGameToClientMock).toHaveBeenCalledWith(playersMock[0], [
        'socketId1',
      ]);
      expect(sendGameToClientMock).toHaveBeenCalledWith(playersMock[1], [
        'socketId2',
      ]);
      playersMock.forEach((player) => {
        expect(player.addTetromino).toHaveBeenCalled();
      });
    });
  });

  describe('gamePlayMulti', () => {
    it('should process multiplayer gameplay actions', async () => {
      // Mock des dépendances
      const sendGameToClientMock = jest
        .spyOn(Game.prototype, 'sendGameToClient')
        .mockImplementation();
      const playersMock = [
        new Player('player1', 'uuid1'),
        new Player('player2', 'uuid2'),
      ];
      playersMock.forEach((player) => {
        jest.spyOn(player, 'moveDownTetromino').mockImplementation();
        jest.spyOn(player, 'getToken').mockReturnValue(0);
        jest.spyOn(player, 'updateGrid').mockReturnValue({ nbrLineToAdd: 1 });
        jest.spyOn(player, 'addLine').mockImplementation();
        jest.spyOn(player, 'setToken').mockImplementation();
        jest.spyOn(player, 'updateSpectrum').mockImplementation();
        jest.spyOn(player, 'getSpectrum').mockReturnValue([[0, 1, 0]]);
        jest
          .spyOn(player, 'getPlayerName')
          .mockReturnValue(player.getPlayerName());
        jest.spyOn(player, 'getUuid').mockReturnValue(player.getUuid());
      });
      const game = new Game(
        playersMock,
        roomId,
        gameType,
        {} as unknown as Server,
      );
      const UUIDMapings = new Map<string, ClientInfo>();
      UUIDMapings.set('uuid1', {
        socketsId: ['socketId1'],
        ownedRoomsId: ['room1'],
        otherRoomsId: [],
        name: 'player1',
      });
      UUIDMapings.set('uuid2', {
        socketsId: ['socketId2'],
        ownedRoomsId: [],
        otherRoomsId: ['room1'],
        name: 'player2',
      });
      await game.gamePlayMulti(UUIDMapings);
      playersMock.forEach((player, index) => {
        expect(player.moveDownTetromino).toHaveBeenCalled();
        expect(player.updateGrid).toHaveBeenCalledWith(0);
        if (index === 0) {
          expect(playersMock[1].addLine).toHaveBeenCalledWith(1);
        }
        expect(player.updateSpectrum).toHaveBeenCalled();
        expect(sendGameToClientMock).toHaveBeenCalledWith(
          player,
          UUIDMapings.get(player.getUuid())?.socketsId ?? [],
          expect.arrayContaining([
            expect.objectContaining({
              name: playersMock[
                (index + 1) % playersMock.length
              ].getPlayerName(),
              spectrum:
                playersMock[(index + 1) % playersMock.length].getSpectrum(),
            }),
          ]),
        );
      });
    });
  });

  describe('endGame', () => {
    it('should end the game for a single player who lost', () => {
      const serverMock = {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      } as unknown as jest.Mocked<Server>;
      const playerMock = new Player('player1', 'uuid1');
      playerMock.isPlayerLost = jest.fn().mockReturnValue(true);
      const playersMock = [playerMock];
      const game = new Game(playersMock, roomId, SINGLE, serverMock);
      const UUIDMapings = new Map<string, ClientInfo>();

      const result = game.endGame(UUIDMapings);

      expect(result).toBe(true);
      expect(serverMock.to).toHaveBeenCalledWith(roomId);
      expect(serverMock.to(roomId).emit).toHaveBeenCalledWith('endGame', {
        player: {
          grid: playerMock.getGrid(),
          name: playerMock.getPlayerName(),
          uuid: playerMock.getUuid(),
          roomId: roomId,
          type: SINGLE,
          winner: false,
        },
      });
    });

    it('should end the game for the last remaining player in a multiplayer game', () => {
      const serverMock = {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      } as unknown as jest.Mocked<Server>;
      const player1Mock = new Player('player1', 'uuid1');
      const player2Mock = new Player('player2', 'uuid2');
      player1Mock.isPlayerLost = jest.fn().mockReturnValue(true);
      player2Mock.isPlayerLost = jest.fn().mockReturnValue(false);
      const playersMock = [player1Mock, player2Mock];
      const game = new Game(playersMock, roomId, MULTI, serverMock);
      const UUIDMapings = new Map<string, ClientInfo>();
      UUIDMapings.set('uuid1', {
        socketsId: ['socket1'],
        ownedRoomsId: [],
        otherRoomsId: [],
        name: 'player1',
      });
      UUIDMapings.set('uuid2', {
        socketsId: ['socket2'],
        ownedRoomsId: [],
        otherRoomsId: [],
        name: 'player2',
      });

      const result = game.endGame(UUIDMapings);

      expect(result).toBe(true);
      expect(serverMock.to).toHaveBeenCalledWith(['socket2']);
      expect(serverMock.to(['socket2']).emit).toHaveBeenCalledWith('endGame', {
        player: {
          grid: player2Mock.getGrid(),
          name: player2Mock.getPlayerName(),
          uuid: player2Mock.getUuid(),
          roomId: roomId,
          type: MULTI,
          winner: true,
        },
      });
    });
  });

  describe('sendCounterToClient', () => {
    it('should send "beforeGame" and "countdown" events', async () => {
      const serverMock = {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      } as unknown as jest.Mocked<Server>;

      const playerMock = new Player('player1', 'uuid1');
      playerMock.getGrid = jest.fn().mockReturnValue('gridData');
      playerMock.getPlayerName = jest.fn().mockReturnValue('Player 1');
      playerMock.getUuid = jest.fn().mockReturnValue('uuid1');
      playerMock.getTetrominos = jest
        .fn()
        .mockReturnValue([
          'tetromino1',
          'tetromino2',
          'tetromino3',
          'tetromino4',
          'tetromino5',
        ]);

      const roomId = 'test-room-id';
      const game = new Game([playerMock], roomId, SINGLE, serverMock);

      const socketIdMock = ['socketId1'];

      const promise = game.sendCounterToClient(playerMock, socketIdMock);

      jest.useFakeTimers();
      jest.advanceTimersByTime(5000);

      await expect(promise).resolves.not.toThrow();
      jest.useRealTimers();
    });
  });

  // a faire plus tard
  describe('gamePlay', () => {
    it('should process gameplay actions', () => {
      const game = new Game(playersMock, roomId, SINGLE, serverMock);
      const moveDownSpy = jest
        .spyOn(playersMock[0], 'moveDownTetromino')
        .mockImplementation(() => {});

      game.gamePlay(playersMock[0], { touch1: 1, touch2: 2 }, ['socketId1']);

      expect(moveDownSpy).toHaveBeenCalled();
    });
  });

  describe('sendGameToClient', () => {
    it('should send the game to the client', () => {
      const sendGameToClientMock = jest
        .spyOn(Game.prototype, 'sendGameToClient')
        .mockImplementation();
      const playerMock = new Player('player1', 'uuid1');
      playerMock.getGrid = jest.fn().mockReturnValue('gridData');
      playerMock.getPlayerName = jest.fn().mockReturnValue('Player 1');
      playerMock.getUuid = jest.fn().mockReturnValue('uuid1');
      playerMock.getTetrominos = jest
        .fn()
        .mockReturnValue([
          'tetromino1',
          'tetromino2',
          'tetromino3',
          'tetromino4',
          'tetromino5',
        ]);

      const roomId = 'test-room-id';
      const game2 = new Game([playerMock], roomId, SINGLE, serverMock);

      const socketIdMock = ['socketId1'];

      game2.sendGameToClient(playerMock, socketIdMock);
    });
  });
});
