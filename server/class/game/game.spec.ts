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
    jest.restoreAllMocks();
  });

  it('should create a Game instance', () => {
    const game = new Game(playersMock, roomId, gameType, serverMock);

    expect(game).toBeInstanceOf(Game);
    expect(game.getRoomId()).toBe(roomId);
    expect(game.getType()).toBe(gameType);
    expect(game.getPlayers()).toEqual(playersMock);
    expect(game.getIsStarted()).toBe(false);
    expect(game.getWaitingPlayers()).toHaveLength(0);
    expect(game.getLostPlayers()).toHaveLength(0);
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
      const lostPlayers = game.getLostPlayers();
      lostPlayers.push(playersMock[0]);
      lostPlayers.push(playersMock[1]);
      game.removeLostPlayer(playersMock[1].getUuid());

      expect(game.getLostPlayers()).toHaveLength(1);
      expect(game.getLostPlayers()).toContain(playersMock[0]);
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

      expect(game.getWaitingPlayers()).toHaveLength(1);
      expect(game.getWaitingPlayers()).toContain(playersMock[0]);
    });
  });

  describe('changePlayerToWaiting', () => {
    it('should change a player to waiting', () => {
      const game = new Game(playersMock, roomId, gameType, serverMock);
      game.changePlayerToWaiting(playersMock[0].getUuid());
      expect(game.getWaitingPlayers()).toHaveLength(1);
      expect(game.getWaitingPlayers()).toContain(playersMock[0]);
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
        lobbyRoomsId: [],
        name: 'player1',
      });
      UUIDMapings.set('uuid2', {
        socketsId: ['socketId2'],
        ownedRoomsId: [],
        otherRoomsId: ['room1'],
        lobbyRoomsId: [],
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
        lobbyRoomsId: [],
        name: 'player1',
      });
      UUIDMapings.set('uuid2', {
        socketsId: ['socketId2'],
        ownedRoomsId: [],
        otherRoomsId: ['room1'],
        lobbyRoomsId: [],
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
        lobbyRoomsId: [],
        name: 'player1',
      });
      UUIDMapings.set('uuid2', {
        socketsId: ['socket2'],
        ownedRoomsId: [],
        otherRoomsId: [],
        lobbyRoomsId: [],
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
      const localServerMock = {
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

      const localRoomId = 'test-room-id';
      const game = new Game([playerMock], localRoomId, SINGLE, localServerMock);

      const socketIdMock = ['socketId1'];

      // fake timers are already set in beforeEach
      const promise = game.sendCounterToClient(playerMock, socketIdMock);

      // Advance enough for all intervals (4 at time=4, then 3,2,1,0, then resolve)
      jest.advanceTimersByTime(7000);

      await promise;

      expect(localServerMock.to).toHaveBeenCalled();
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

  describe('getIsStarting / setIsStarting', () => {
    it('should get and set isStarting', () => {
      const game = new Game([], roomId, SINGLE, serverMock);
      expect(game.getIsStarting()).toBe(false);
      game.setIsStarting(true);
      expect(game.getIsStarting()).toBe(true);
    });
  });

  describe('getInitialPlayerCount', () => {
    it('should return 0 by default', () => {
      const game = new Game([], roomId, SINGLE, serverMock);
      expect(game.getInitialPlayerCount()).toBe(0);
    });
  });

  describe('removeWaitingPlayer', () => {
    it('should remove a waiting player by uuid', () => {
      const game = new Game([], roomId, SINGLE, serverMock);
      const player = new Player('p1', 'uuid1');
      game.addWaitingPlayer(player);
      expect(game.getWaitingPlayers()).toHaveLength(1);
      game.removeWaitingPlayer('uuid1');
      expect(game.getWaitingPlayers()).toHaveLength(0);
    });
  });

  describe('removePlayerFromAll', () => {
    it('should remove player from all lists', () => {
      const player = new Player('p1', 'uuid1');
      const game = new Game([player], roomId, SINGLE, serverMock);
      game.getLostPlayers().push(new Player('p1', 'uuid1'));
      game.addWaitingPlayer(new Player('p1', 'uuid1'));

      game.removePlayerFromAll('uuid1');

      expect(game.getPlayers()).toHaveLength(0);
      expect(game.getLostPlayers()).toHaveLength(0);
      expect(game.getWaitingPlayers()).toHaveLength(0);
    });
  });

  describe('isEmpty', () => {
    it('should return true when all lists are empty', () => {
      const game = new Game([], roomId, SINGLE, serverMock);
      expect(game.isEmpty()).toBe(true);
    });

    it('should return false when players exist', () => {
      const game = new Game([new Player('p1', 'uuid1')], roomId, SINGLE, serverMock);
      expect(game.isEmpty()).toBe(false);
    });

    it('should return false when waiting players exist', () => {
      const game = new Game([], roomId, SINGLE, serverMock);
      game.addWaitingPlayer(new Player('p1', 'uuid1'));
      expect(game.isEmpty()).toBe(false);
    });

    it('should return false when lost players exist', () => {
      const game = new Game([], roomId, SINGLE, serverMock);
      game.getLostPlayers().push(new Player('p1', 'uuid1'));
      expect(game.isEmpty()).toBe(false);
    });
  });

  describe('changePlayerToWaiting - from lost players', () => {
    it('should move a lost player to waiting', () => {
      const game = new Game([], roomId, SINGLE, serverMock);
      const player = new Player('p1', 'uuid1');
      game.getLostPlayers().push(player);

      game.changePlayerToWaiting('uuid1');

      expect(game.getWaitingPlayers()).toHaveLength(1);
      expect(game.getWaitingPlayers()[0]).toBe(player);
      expect(game.getLostPlayers()).toHaveLength(0);
    });

    it('should do nothing if player not in any list', () => {
      const game = new Game([], roomId, SINGLE, serverMock);
      game.changePlayerToWaiting('nonexistent');
      expect(game.getWaitingPlayers()).toHaveLength(0);
    });
  });

  describe('fallDown - with penalty lines', () => {
    it('should add penalty lines to other players', () => {
      const player1 = new Player('p1', 'uuid1');
      const player2 = new Player('p2', 'uuid2');
      jest.spyOn(player1, 'fallTetromino').mockImplementation(() => 2 as any);
      jest.spyOn(player1, 'updateSpectrum').mockImplementation();
      jest.spyOn(player2, 'addLine').mockImplementation();
      jest.spyOn(player2, 'getSpectrum').mockReturnValue([[0]]);

      const game = new Game([player1, player2], roomId, MULTI, serverMock);
      game.fallDown('uuid1', ['socketId1']);

      expect(player2.addLine).toHaveBeenCalledWith(2);
    });

    it('should not add penalty lines when nbLine is 0', () => {
      const player1 = new Player('p1', 'uuid1');
      const player2 = new Player('p2', 'uuid2');
      jest.spyOn(player1, 'fallTetromino').mockImplementation(() => 0 as any);
      jest.spyOn(player1, 'updateSpectrum').mockImplementation();
      jest.spyOn(player2, 'addLine').mockImplementation();
      jest.spyOn(player2, 'getSpectrum').mockReturnValue([[0]]);

      const game = new Game([player1, player2], roomId, MULTI, serverMock);
      game.fallDown('uuid1', ['socketId1']);

      expect(player2.addLine).not.toHaveBeenCalled();
    });

    it('should do nothing if player not found', () => {
      const game = new Game([], roomId, MULTI, serverMock);
      game.fallDown('nonexistent', ['socketId1']);
      // No error
    });
  });

  describe('endGame - MULTI solo in room', () => {
    it('should end game for solo player in MULTI room', () => {
      const player = new Player('p1', 'uuid1');
      player.isPlayerLost = jest.fn().mockReturnValue(true);
      const game = new Game([player], roomId, MULTI, serverMock);
      // Simulate startGame with 1 player by setting _initialPlayerCount
      (game as any)._initialPlayerCount = 1;

      const UUIDMapings = new Map<string, ClientInfo>();
      UUIDMapings.set('uuid1', {
        socketsId: ['socket1'],
        ownedRoomsId: [],
        otherRoomsId: [],
        lobbyRoomsId: [],
        name: 'p1',
      });

      const result = game.endGame(UUIDMapings);
      expect(result).toBe(true);
      expect(serverMock.to).toHaveBeenCalledWith(['socket1']);
    });

    it('should return false if solo player in MULTI room has not lost', () => {
      const player = new Player('p1', 'uuid1');
      player.isPlayerLost = jest.fn().mockReturnValue(false);
      const game = new Game([player], roomId, MULTI, serverMock);
      (game as any)._initialPlayerCount = 1;

      const UUIDMapings = new Map<string, ClientInfo>();
      const result = game.endGame(UUIDMapings);
      expect(result).toBe(false);
    });
  });

  describe('endGame - returns false when game not over', () => {
    it('should return false when SINGLE player has not lost', () => {
      const player = new Player('p1', 'uuid1');
      player.isPlayerLost = jest.fn().mockReturnValue(false);
      const game = new Game([player], roomId, SINGLE, serverMock);

      const result = game.endGame(new Map());
      expect(result).toBe(false);
    });

    it('should return false when MULTI players are still alive', () => {
      const player1 = new Player('p1', 'uuid1');
      const player2 = new Player('p2', 'uuid2');
      player1.isPlayerLost = jest.fn().mockReturnValue(false);
      player2.isPlayerLost = jest.fn().mockReturnValue(false);
      const game = new Game([player1, player2], roomId, MULTI, serverMock);
      (game as any)._initialPlayerCount = 2;

      const UUIDMapings = new Map<string, ClientInfo>();
      UUIDMapings.set('uuid1', {
        socketsId: ['s1'], ownedRoomsId: [], otherRoomsId: [], lobbyRoomsId: [], name: 'p1',
      });
      UUIDMapings.set('uuid2', {
        socketsId: ['s2'], ownedRoomsId: [], otherRoomsId: [], lobbyRoomsId: [], name: 'p2',
      });

      const result = game.endGame(UUIDMapings);
      expect(result).toBe(false);
    });
  });

  describe('sendGameToClient - SINGLE type', () => {
    it('should emit to roomId for SINGLE games', () => {
      const player = new Player('p1', 'uuid1');
      jest.spyOn(player, 'getGrid').mockReturnValue([[]]);
      jest.spyOn(player, 'getTetrominos').mockReturnValue([1, 2, 3, 4, 5, 6] as any);

      const game = new Game([player], roomId, SINGLE, serverMock);
      game.sendGameToClient(player, ['socketId1']);

      expect(serverMock.to).toHaveBeenCalledWith(roomId);
    });
  });

  describe('sendGameToClient - empty socketId for MULTI', () => {
    it('should return early if socketId is empty for MULTI', () => {
      const player = new Player('p1', 'uuid1');
      const game = new Game([player], roomId, MULTI, serverMock);
      game.sendGameToClient(player, []);

      // Should not emit since socketId is empty
      expect(serverMock.to).not.toHaveBeenCalled();
    });
  });

  describe('sendGameToClient - MULTI with socketId', () => {
    it('should emit to socketId for MULTI games', () => {
      const player = new Player('p1', 'uuid1');
      jest.spyOn(player, 'getGrid').mockReturnValue([[]]);
      jest.spyOn(player, 'getTetrominos').mockReturnValue([1, 2, 3, 4, 5, 6] as any);

      const game = new Game([player], roomId, MULTI, serverMock);
      game.sendGameToClient(player, ['socketId1'], []);

      expect(serverMock.to).toHaveBeenCalledWith(['socketId1']);
    });
  });

  describe('gamePlayMulti - token handling', () => {
    it('should set token to 0 when token is 1', async () => {
      const sendSpy = jest.spyOn(Game.prototype, 'sendGameToClient').mockImplementation();
      const player = new Player('p1', 'uuid1');
      jest.spyOn(player, 'moveDownTetromino').mockImplementation();
      jest.spyOn(player, 'getToken').mockReturnValue(1);
      jest.spyOn(player, 'setToken').mockImplementation();
      jest.spyOn(player, 'updateSpectrum').mockImplementation();
      jest.spyOn(player, 'getSpectrum').mockReturnValue([[0]]);

      const game = new Game([player], roomId, MULTI, serverMock);
      const UUIDMapings = new Map<string, ClientInfo>();
      UUIDMapings.set('uuid1', {
        socketsId: ['s1'], ownedRoomsId: [], otherRoomsId: [], lobbyRoomsId: [], name: 'p1',
      });

      await game.gamePlayMulti(UUIDMapings);
      expect(player.setToken).toHaveBeenCalledWith(0);
      sendSpy.mockRestore();
    });
  });

  describe('startGame - MULTI type', () => {
    it('should move waiting players to active players for MULTI', async () => {
      const sendCounterSpy = jest.spyOn(Game.prototype, 'sendCounterToClient').mockResolvedValue();
      const sendGameSpy = jest.spyOn(Game.prototype, 'sendGameToClient').mockImplementation();

      const player1 = new Player('p1', 'uuid1');
      const player2 = new Player('p2', 'uuid2');
      jest.spyOn(player1, 'initTetrominoInsideGrid').mockImplementation();
      jest.spyOn(player2, 'initTetrominoInsideGrid').mockImplementation();

      const game = new Game([], roomId, MULTI, serverMock);
      game.addWaitingPlayer(player1);
      game.addWaitingPlayer(player2);

      const UUIDMapings = new Map<string, ClientInfo>();
      UUIDMapings.set('uuid1', {
        socketsId: ['s1'], ownedRoomsId: [], otherRoomsId: [], lobbyRoomsId: [], name: 'p1',
      });
      UUIDMapings.set('uuid2', {
        socketsId: ['s2'], ownedRoomsId: [], otherRoomsId: [], lobbyRoomsId: [], name: 'p2',
      });

      await game.startGame(UUIDMapings);

      expect(game.getPlayers()).toHaveLength(2);
      expect(game.getWaitingPlayers()).toHaveLength(0);
      expect(game.getIsStarted()).toBe(true);
      expect(game.getInitialPlayerCount()).toBe(2);

      sendCounterSpy.mockRestore();
      sendGameSpy.mockRestore();
    });
  });
});
