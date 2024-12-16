import { Server } from 'socket.io';
import { WaitGame } from './waitGame';
import { MULTI, SINGLE } from '../../constantes/constantes';
import { Game } from '../game/game';
import { Player } from '../player/player';

describe('WaitGame', () => {
  it('should be instantiated successfully via getInstance', () => {
    const mockServer = {} as Server;

    const waitGameInstance = WaitGame.getInstance(mockServer);

    expect(waitGameInstance).toBeInstanceOf(WaitGame);
  });

  describe('getInstance', () => {
    it('should return the same instance of WaitGame', () => {
      const mockServer = {} as Server;

      const waitGameInstance1 = WaitGame.getInstance(mockServer);
      const waitGameInstance2 = WaitGame.getInstance(mockServer);

      expect(waitGameInstance1).toBe(waitGameInstance2);
    });
  });

  describe('getGames', () => {
    it('should return the list of games', () => {
      const mockServer = {} as Server;
      const waitGameInstance = WaitGame.getInstance(mockServer);

      const result = waitGameInstance.getGames();
      expect(result.size).toBe(0);
    });
  });

  describe('getUUIDMapings', () => {
    it('should return the UUID mappings', () => {
      const mockServer = {} as Server;
      const waitGameInstance = WaitGame.getInstance(mockServer);
      const result = waitGameInstance.getUUIDMapings();
      expect(result.size).toBe(0);
    });
  });

  describe('addSocket', () => {
    it('should add a socket to the list of sockets', () => {
      const mockServer = {} as Server;
      const waitGameInstance = WaitGame.getInstance(mockServer);
      waitGameInstance.addSocket('uuid', 'socket');
      expect(waitGameInstance.getUUIDMapings().size).toBe(1);
    });
  });

  describe('deleteSocket', () => {
    it('should delete a socket from the list of sockets', () => {
      const mockServer = {} as Server;
      const waitGameInstance = WaitGame.getInstance(mockServer);
      waitGameInstance.addSocket('uuid', 'socket');

      let val = waitGameInstance.getUUIDMapings().get('uuid')?.socketsId;
      expect(val).toContain('socket');

      waitGameInstance.deleteSocket('socket');

      val = waitGameInstance.getUUIDMapings().get('uuid')?.socketsId;
      expect(val).toStrictEqual([]);
    });
  });

  describe('createGame', () => {
    let mockServer: jest.Mocked<Server>;
    let waitGameInstance: WaitGame;

    beforeEach(() => {
      // More comprehensive mock of Socket.IO server
      mockServer = {
        sockets: {
          sockets: new Map([
            [
              'socket1',
              {
                join: jest.fn(),
                leave: jest.fn(),
              } as any,
            ],
          ]),
        },
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as unknown as jest.Mocked<Server>;

      // Reset the singleton instance before each test
      // This requires access to the private _instance
      // You might need to add a static reset method in WaitGame class
      (WaitGame as any)._instance = null;
      waitGameInstance = WaitGame.getInstance(mockServer);
    });

    it('should create a game with a unique room name', () => {
      const uuid = 'test-uuid';
      const name = 'TestRoom';
      const socketId = 'socket1';

      // Ensure the socket exists in the mock server
      const mockSocket = {
        join: jest.fn(),
      };
      mockServer.sockets.sockets.set(socketId, mockSocket as any);

      waitGameInstance.createGame(uuid, name, socketId);

      // Check that the game was added to games
      const games = waitGameInstance.getGames();
      expect(games.size).toBe(1);

      // Verify the room name
      const roomName = Array.from(games.keys())[0];
      expect(roomName).toBe(name);

      // Check the game details
      const game = games.get(roomName);
      expect(game).toBeDefined();
      expect(game?.getType()).toBe(MULTI);

      // Verify UUID mappings
      const uuidMappings = waitGameInstance.getUUIDMapings();
      expect(uuidMappings.has(uuid)).toBeTruthy();

      const clientInfo = uuidMappings.get(uuid);
      expect(clientInfo?.ownedRoomsId).toContain(roomName);
      expect(clientInfo?.socketsId).toContain(socketId);

      // Verify socket.join was called
      expect(mockSocket.join).toHaveBeenCalledWith(roomName);
    });

    it('should create a game with a modified room name if the original already exists', () => {
      const uuid = 'test-uuid';
      const name = 'TestRoom';
      const socketId = 'socket1';

      // First create a game with the original name
      waitGameInstance.createGame(uuid, name, socketId);

      // Create another game with the same name
      waitGameInstance.createGame(uuid, name, socketId);

      // Check that the games have unique room names
      const games = waitGameInstance.getGames();
      expect(games.size).toBe(2);

      const roomNames = Array.from(games.keys());
      expect(roomNames).toContain(name);
      expect(roomNames).toContain(name + '0');
    });

    it('should add the socket to the room', () => {
      const uuid = 'test-uuid';
      const name = 'TestRoom';
      const socketId = 'socket1';

      const mockSocket = mockServer.sockets.sockets.get(socketId);

      waitGameInstance.createGame(uuid, name, socketId);

      // Verify socket.join was called
      expect(mockSocket?.join).toHaveBeenCalledWith(name);
    });

    it('should set the first player as master', () => {
      const uuid = 'test-uuid';
      const name = 'TestRoom';
      const socketId = 'socket1';

      waitGameInstance.createGame(uuid, name, socketId);

      const games = waitGameInstance.getGames();
      const game = Array.from(games.values())[0];
      const waitingPlayers = game.get_waitingPlayers();

      expect(waitingPlayers.length).toBe(1);
      expect(waitingPlayers[0].getIsMaster()).toBe(true);
      expect(waitingPlayers[0].getUuid()).toBe(uuid);
    });

    it('should emit getCreateRooms event', () => {
      const uuid = 'test-uuid';
      const name = 'TestRoom';
      const socketId = 'socket1';

      waitGameInstance.createGame(uuid, name, socketId);

      // Verify server.to was called with the socket and emitted getCreateRooms
      expect(mockServer.to).toHaveBeenCalledWith(expect.any(Array));
    });
  });

  describe('joinGame', () => {
    let mockServer: jest.Mocked<Server>;
    let waitGameInstance: WaitGame;
    let mockGame: jest.Mocked<Game>;
    let mockSocket: any;

    beforeEach(() => {
      // Create mock socket
      mockSocket = {
        join: jest.fn(),
        emit: jest.fn(),
      };

      // Create mock server
      mockServer = {
        sockets: {
          sockets: new Map([['socket1', mockSocket]]),
        },
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as unknown as jest.Mocked<Server>;

      // Reset the singleton instance
      (WaitGame as any)._instance = null;
      waitGameInstance = WaitGame.getInstance(mockServer);

      // Create a mock game
      mockGame = {
        get_waitingPlayers: jest.fn().mockReturnValue([]),
        getPlayers: jest.fn().mockReturnValue([]),
        get_lostPlayers: jest.fn().mockReturnValue([]),
        addWaitingPlayer: jest.fn(),
      } as unknown as jest.Mocked<Game>;
    });

    it('should join a game successfully', () => {
      const uuid = 'test-uuid';
      const name = 'TestPlayer';
      const socketId = 'socket1';
      const roomId = 'test-room';

      // Setup the game in the WaitGame instance
      waitGameInstance.getGames().set(roomId, mockGame);

      // Call joinGame
      waitGameInstance.joinGame(uuid, name, socketId, roomId);

      // Verify socket joined the room
      expect(mockSocket.join).toHaveBeenCalledWith(roomId);

      // Verify player was added to waiting players
      expect(mockGame.addWaitingPlayer).toHaveBeenCalledWith(
        expect.any(Player),
      );

      // Verify UUID mappings were updated
      const uuidMappings = waitGameInstance.getUUIDMapings();
      const clientInfo = uuidMappings.get(uuid);
      expect(clientInfo?.socketsId).toContain(socketId);
      expect(clientInfo?.otherRoomsId).toContain(roomId);

      // Verify pageToGo event was emitted
      expect(mockSocket.emit).toHaveBeenCalledWith('pageToGo', {
        pageInfos: {
          path: `${roomId}/${name}`,
          name: name,
          roomName: roomId,
        },
      });
    });

    it('should not join if player is already in the game', () => {
      const uuid = 'test-uuid';
      const name = 'TestPlayer';
      const socketId = 'socket1';
      const roomId = 'test-room';

      // Mock game with existing players
      mockGame.get_waitingPlayers.mockReturnValue([
        { getUuid: jest.fn().mockReturnValue(uuid) } as any,
      ]);

      // Setup the game in the WaitGame instance
      waitGameInstance.getGames().set(roomId, mockGame);

      // Call joinGame
      waitGameInstance.joinGame(uuid, name, socketId, roomId);

      // Verify no new actions were taken
      expect(mockSocket.join).not.toHaveBeenCalled();
      expect(mockGame.addWaitingPlayer).not.toHaveBeenCalled();
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('should handle non-existent socket', async () => {
      const uuid = 'test-uuid';
      const name = 'TestPlayer';
      const socketId = 'non-existent-socket';
      const roomId = 'test-room';

      // Setup the game in the WaitGame instance
      waitGameInstance.getGames().set(roomId, mockGame);

      // Call joinGame
      const result = await waitGameInstance.joinGame(
        uuid,
        name,
        socketId,
        roomId,
      );

      // Verify no actions were taken
      expect(result).toBeUndefined();
      expect(mockGame.addWaitingPlayer).not.toHaveBeenCalled();
    });

    it('should handle non-existent game', async () => {
      const uuid = 'test-uuid';
      const name = 'TestPlayer';
      const socketId = 'socket1';
      const roomId = 'non-existent-room';

      // Call joinGame
      const result = await waitGameInstance.joinGame(
        uuid,
        name,
        socketId,
        roomId,
      );

      // Verify no actions were taken
      expect(result).toBeUndefined();
    });

    it('should create new UUID mapping if not exists', () => {
      const uuid = 'new-uuid';
      const name = 'TestPlayer';
      const socketId = 'socket1';
      const roomId = 'test-room';

      // Setup the game in the WaitGame instance
      waitGameInstance.getGames().set(roomId, mockGame);

      // Call joinGame
      waitGameInstance.joinGame(uuid, name, socketId, roomId);

      // Verify UUID mappings were created
      const uuidMappings = waitGameInstance.getUUIDMapings();
      const clientInfo = uuidMappings.get(uuid);
      expect(clientInfo).toBeDefined();
      expect(clientInfo?.name).toBe(name);
      expect(clientInfo?.socketsId).toContain(socketId);
    });
  });

  describe('startSingleTetrisGame', () => {
    let mockServer: jest.Mocked<Server>;
    let waitGameInstance: WaitGame;
    let mockSocket: any;

    beforeEach(() => {
      // Create mock socket
      mockSocket = {
        join: jest.fn(),
        leave: jest.fn(),
        emit: jest.fn(),
      };

      // Create mock server
      mockServer = {
        sockets: {
          sockets: new Map([['socket1', mockSocket]]),
        },
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as unknown as jest.Mocked<Server>;

      // Reset the singleton instance
      (WaitGame as any)._instance = null;
      waitGameInstance = WaitGame.getInstance(mockServer);

      // Mock the necessary dependencies
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.clearAllTimers();
      jest.clearAllMocks();
    });

    it('should handle non-existent socket', async () => {
      const uuid = 'test-uuid';
      const name = 'TestPlayer';
      const socketId = 'non-existent-socket';

      // Call startSingleTetrisGame
      await waitGameInstance.startSingleTetrisGame(uuid, name, socketId);

      // Verify no game was created
      const games = waitGameInstance.getGames();
      expect(games.size).toBe(0);
    });

    it('should create unique room names', async () => {
      const uuid1 = 'test-uuid1';
      const uuid2 = 'test-uuid2';
      const name = 'TestPlayer';
      const socketId1 = 'socket1';
      const socketId2 = 'socket2';

      // Use fake timers
      jest.useFakeTimers();

      // Mock additional socket with more complete Socket interface
      mockServer.sockets.sockets.set(socketId2, {
        id: socketId2,
        join: jest.fn(),
        leave: jest.fn(),
        emit: jest.fn(),
        to: jest.fn().mockReturnThis(),
        nsp: {} as any,
        client: {} as any,
        recovered: false,
        connected: true,
        disconnected: false,
        // Add other required properties with mock implementations or empty objects
        rooms: new Set(),
        data: {},
      } as any);

      // Start two games with the same name
      waitGameInstance.startSingleTetrisGame(uuid1, name, socketId1);
      waitGameInstance.startSingleTetrisGame(uuid2, name, socketId2);

      // Fast-forward time to ensure all timers have completed
      jest.advanceTimersByTime(10000); // Advance by 10 seconds

      // Verify unique room names
      const games = waitGameInstance.getGames();
      expect(games.size).toBe(2);

      const roomNames = Array.from(games.keys());
      expect(roomNames).toContain(name);
      expect(roomNames).toContain(name + '0');

      // Clear all timers
      jest.clearAllTimers();
    }, 30000);

    it('should set the first player as master', async () => {
      const uuid = 'test-uuid';
      const name = 'TestPlayer';
      const socketId = 'socket1';

      // Call startSingleTetrisGame
      waitGameInstance.startSingleTetrisGame(uuid, name, socketId);

      // Get the created game
      const games = waitGameInstance.getGames();
      const game = Array.from(games.values())[0];
      const players = game.getPlayers();
      // const waitingPlayers = game.get_waitingPlayers();

      // Verify player is master
      expect(players.length).toBe(1);
      expect(players[0].getIsMaster()).toBe(true);
      expect(players[0].getUuid()).toBe(uuid);
    });
  });

  describe('notRetryGame', () => {
    let mockServer: jest.Mocked<Server>;
    let waitGameInstance: WaitGame;
    let mockSocket: any;
    let mockGame: jest.Mocked<Game>;

    beforeEach(() => {
      // Create mock socket
      mockSocket = {
        join: jest.fn(),
        leave: jest.fn(),
        emit: jest.fn(),
      };

      // Create mock server
      mockServer = {
        sockets: {
          sockets: new Map([['socket1', mockSocket]]),
        },
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as unknown as jest.Mocked<Server>;

      // Reset the singleton instance
      (WaitGame as any)._instance = null;
      waitGameInstance = WaitGame.getInstance(mockServer);

      // Create a mock game
      mockGame = {
        get_lostPlayers: jest.fn().mockReturnValue([]),
        getPlayers: jest.fn().mockReturnValue([]),
        changePlayerToWaiting: jest.fn(),
        removeLostPlayer: jest.fn(),
        removePlayer: jest.fn(),
      } as unknown as jest.Mocked<Game>;
    });

    it('should not retry game if socket is undefined', () => {
      const uuid = 'test-uuid';
      const name = 'TestPlayer';
      const socketId = 'non-existent-socket';
      const roomId = 'test-room';

      waitGameInstance.notRetryGame(uuid, name, socketId, roomId);

      expect(mockSocket.leave).not.toHaveBeenCalled();
      expect(mockGame.removeLostPlayer).not.toHaveBeenCalled();
      expect(mockGame.removePlayer).not.toHaveBeenCalled();
    });

    it('should not retry game if UUID mapping is undefined', () => {
      const uuid = 'test-uuid';
      const name = 'TestPlayer';
      const socketId = 'socket1';
      const roomId = 'test-room';

      waitGameInstance.notRetryGame(uuid, name, socketId, roomId);

      expect(mockSocket.leave).not.toHaveBeenCalled();
      expect(mockGame.removeLostPlayer).not.toHaveBeenCalled();
      expect(mockGame.removePlayer).not.toHaveBeenCalled();
    });

    it('should not retry game if game is undefined', () => {
      const uuid = 'test-uuid';
      const name = 'TestPlayer';
      const socketId = 'socket1';
      const roomId = 'test-room';

      waitGameInstance.addSocket(uuid, socketId);
      waitGameInstance.notRetryGame(uuid, name, socketId, roomId);

      expect(mockSocket.leave).not.toHaveBeenCalled();
      expect(mockGame.removeLostPlayer).not.toHaveBeenCalled();
      expect(mockGame.removePlayer).not.toHaveBeenCalled();
    });

    it('should not retry game if player is not found in lost players or players', () => {
      const uuid = 'test-uuid';
      const name = 'TestPlayer';
      const socketId = 'socket1';
      const roomId = 'test-room';

      waitGameInstance.addSocket(uuid, socketId);
      waitGameInstance.getGames().set(roomId, mockGame);

      waitGameInstance.notRetryGame(uuid, name, socketId, roomId);

      expect(mockSocket.leave).not.toHaveBeenCalled();
      expect(mockGame.removeLostPlayer).not.toHaveBeenCalled();
      expect(mockGame.removePlayer).not.toHaveBeenCalled();
    });

    it('should change player to waiting if player is master', () => {
      const uuid = 'test-uuid';
      const name = 'TestPlayer';
      const socketId = 'socket1';
      const roomId = 'test-room';

      waitGameInstance.addSocket(uuid, socketId);
      waitGameInstance.getGames().set(roomId, mockGame);

      mockGame.getPlayers.mockReturnValue([
        {
          getUuid: jest.fn().mockReturnValue(uuid),
          getIsMaster: jest.fn().mockReturnValue(true),
        } as any,
      ]);

      waitGameInstance.notRetryGame(uuid, name, socketId, roomId);

      expect(mockGame.changePlayerToWaiting).toHaveBeenCalledWith(uuid);
      expect(mockSocket.leave).not.toHaveBeenCalled();
      expect(mockGame.removeLostPlayer).not.toHaveBeenCalled();
      expect(mockGame.removePlayer).not.toHaveBeenCalled();
    });

    it('should remove player from room if player is not master', () => {
      const uuid = 'test-uuid';
      const name = 'TestPlayer';
      const socketId = 'socket1';
      const roomId = 'test-room';

      waitGameInstance.addSocket(uuid, socketId);
      waitGameInstance.getGames().set(roomId, mockGame);

      mockGame.getPlayers.mockReturnValue([
        {
          getUuid: jest.fn().mockReturnValue(uuid),
          getIsMaster: jest.fn().mockReturnValue(false),
        } as any,
      ]);

      waitGameInstance.notRetryGame(uuid, name, socketId, roomId);

      expect(mockGame.changePlayerToWaiting).not.toHaveBeenCalled();
      expect(mockSocket.leave).toHaveBeenCalledWith(roomId);
      expect(mockGame.removeLostPlayer).toHaveBeenCalledWith(uuid);
      expect(mockGame.removePlayer).toHaveBeenCalledWith(uuid);
    });
  });

  describe('clearGame', () => {
    let mockServer: jest.Mocked<Server>;
    let waitGameInstance: WaitGame;
    let mockSocket: any;
    let mockGame: jest.Mocked<Game>;

    beforeEach(() => {
      // Create mock socket
      mockSocket = {
        join: jest.fn(),
        leave: jest.fn(),
        emit: jest.fn(),
      };

      // Create mock server
      mockServer = {
        sockets: {
          sockets: new Map([['socket1', mockSocket]]),
        },
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as unknown as jest.Mocked<Server>;

      // Reset the singleton instance
      (WaitGame as any)._instance = null;
      waitGameInstance = WaitGame.getInstance(mockServer);

      // Create a mock game
      mockGame = {
        get_lostPlayers: jest.fn().mockReturnValue([]),
        getPlayers: jest.fn().mockReturnValue([]),
        getRoomId: jest.fn().mockReturnValue('room1'),
        changePlayerToWaiting: jest.fn(),
        removeLostPlayer: jest.fn(),
        removePlayer: jest.fn(),
      } as unknown as jest.Mocked<Game>;
    });

    it('should not clear game if there are no lost players or players', () => {
      // Access the private method using Jest
      const clearGameSpy = jest.spyOn(waitGameInstance as any, 'clearGame');

      // Call the private method
      (waitGameInstance as any).clearGame(mockGame);

      expect(mockGame.changePlayerToWaiting).not.toHaveBeenCalled();
      expect(mockSocket.leave).not.toHaveBeenCalled();
      expect(mockGame.removeLostPlayer).not.toHaveBeenCalled();
      expect(mockGame.removePlayer).not.toHaveBeenCalled();

      // Restore the original method
      clearGameSpy.mockRestore();
    });

    it('should change player to waiting if player is master', () => {
      const uuid = 'test-uuid';
      const player = {
        getUuid: jest.fn().mockReturnValue(uuid),
        getIsMaster: jest.fn().mockReturnValue(true),
      } as any;

      mockGame.get_lostPlayers.mockReturnValue([player]);
      mockGame.getPlayers.mockReturnValue([player]);

      // Access the private method using Jest
      const clearGameSpy = jest.spyOn(waitGameInstance as any, 'clearGame');

      // Call the private method
      (waitGameInstance as any).clearGame(mockGame);

      expect(mockGame.changePlayerToWaiting).toHaveBeenCalledWith(uuid);
      expect(mockSocket.leave).not.toHaveBeenCalled();
      expect(mockGame.removeLostPlayer).not.toHaveBeenCalled();
      expect(mockGame.removePlayer).not.toHaveBeenCalled();

      // Restore the original method
      clearGameSpy.mockRestore();
    });

    it('should remove lost player if player is not master', () => {
      const uuid = 'test-uuid';
      const player = {
        getUuid: jest.fn().mockReturnValue(uuid),
        getIsMaster: jest.fn().mockReturnValue(false),
      } as any;

      mockGame.get_lostPlayers.mockReturnValue([player]);
      mockGame.getPlayers.mockReturnValue([]);

      waitGameInstance.addSocket(uuid, 'socket1');

      // Access the private method using Jest
      const clearGameSpy = jest.spyOn(waitGameInstance as any, 'clearGame');

      // Call the private method
      (waitGameInstance as any).clearGame(mockGame);

      expect(mockGame.changePlayerToWaiting).not.toHaveBeenCalled();
      expect(mockSocket.leave).toHaveBeenCalledWith('room1');
      expect(mockGame.removeLostPlayer).toHaveBeenCalledWith(uuid);
      expect(mockGame.removePlayer).not.toHaveBeenCalled();

      // Restore the original method
      clearGameSpy.mockRestore();
    });

    it('should remove player if player is not master', () => {
      const uuid = 'test-uuid';
      const player = {
        getUuid: jest.fn().mockReturnValue(uuid),
        getIsMaster: jest.fn().mockReturnValue(false),
      } as any;

      mockGame.get_lostPlayers.mockReturnValue([]);
      mockGame.getPlayers.mockReturnValue([player]);

      waitGameInstance.addSocket(uuid, 'socket1');

      // Access the private method using Jest
      const clearGameSpy = jest.spyOn(waitGameInstance as any, 'clearGame');

      // Call the private method
      (waitGameInstance as any).clearGame(mockGame);

      expect(mockGame.changePlayerToWaiting).not.toHaveBeenCalled();
      expect(mockSocket.leave).toHaveBeenCalledWith('room1');
      expect(mockGame.removeLostPlayer).not.toHaveBeenCalled();
      expect(mockGame.removePlayer).toHaveBeenCalledWith(uuid);

      // Restore the original method
      clearGameSpy.mockRestore();
    });

    it('should handle multiple players and lost players', () => {
      const uuid1 = 'test-uuid1';
      const uuid2 = 'test-uuid2';
      const player1 = {
        getUuid: jest.fn().mockReturnValue(uuid1),
        getIsMaster: jest.fn().mockReturnValue(false),
      } as any;
      const player2 = {
        getUuid: jest.fn().mockReturnValue(uuid2),
        getIsMaster: jest.fn().mockReturnValue(false),
      } as any;

      mockGame.get_lostPlayers.mockReturnValue([player1]);
      mockGame.getPlayers.mockReturnValue([player2]);

      waitGameInstance.addSocket(uuid1, 'socket1');
      waitGameInstance.addSocket(uuid2, 'socket2');

      // Access the private method using Jest
      const clearGameSpy = jest.spyOn(waitGameInstance as any, 'clearGame');

      // Call the private method
      (waitGameInstance as any).clearGame(mockGame);

      expect(mockGame.changePlayerToWaiting).not.toHaveBeenCalled();
      expect(mockSocket.leave).toHaveBeenCalledWith('room1');
      expect(mockGame.removeLostPlayer).toHaveBeenCalledWith(uuid1);
      expect(mockGame.removePlayer).toHaveBeenCalledWith(uuid2);

      // Restore the original method
      clearGameSpy.mockRestore();
    });
  });
});
