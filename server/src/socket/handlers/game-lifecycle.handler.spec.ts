import { Socket } from 'socket.io';
import { registerGameLifecycleHandlers } from './game-lifecycle.handler';
import { HandlerContext } from '../handler-context';
import { SINGLE, MULTI } from '../../../constantes/constantes';

describe('GameLifecycleHandler', () => {
  let mockSocket: jest.Mocked<Socket>;
  let ctx: HandlerContext;
  let eventHandlers: Map<string, Function>;
  let mockWaitGame: any;
  let mockManageSocket: any;

  beforeEach(() => {
    eventHandlers = new Map();
    mockSocket = {
      id: 'socketId1',
      on: jest.fn((event: string, handler: Function) => {
        eventHandlers.set(event, handler);
      }),
      emit: jest.fn(),
    } as unknown as jest.Mocked<Socket>;

    mockWaitGame = {
      getGames: jest.fn(),
      getUUIDMapings: jest.fn(),
      notRetryGame: jest.fn(),
      retryGame: jest.fn(),
      startSingleTetrisGame: jest.fn(),
      startMultiTetrisGame: jest.fn(),
    };

    mockManageSocket = {
      getInfos: jest.fn(),
    };

    ctx = {
      waitGame: mockWaitGame,
      manageSocket: mockManageSocket,
      isValidData: jest.fn(
        (data: any, ...fields: string[]) =>
          data != undefined && fields.every((f) => data[f] != undefined),
      ),
    };

    registerGameLifecycleHandlers(mockSocket, ctx);
  });

  describe('checkGame', () => {
    it('should emit noGame if game not found', () => {
      mockManageSocket.getInfos.mockReturnValue({ name: 'Player1' });
      mockWaitGame.getGames.mockReturnValue(new Map());

      const handler = eventHandlers.get('checkGame')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });

      expect(mockSocket.emit).toHaveBeenCalledWith('noGame');
    });

    it('should emit myGame for SINGLE game', () => {
      const mockPlayer = {
        getGrid: jest.fn().mockReturnValue([[]]),
        getPlayerName: jest.fn().mockReturnValue('Player1'),
        getUuid: jest.fn().mockReturnValue('uuid1'),
        getTetrominos: jest.fn().mockReturnValue([1, 2, 3, 4, 5, 6]),
      };
      const mockGame = {
        getType: jest.fn().mockReturnValue(SINGLE),
        getPlayers: jest.fn().mockReturnValue([mockPlayer]),
        getIsStarted: jest.fn().mockReturnValue(true),
      };
      mockManageSocket.getInfos.mockReturnValue({ name: 'Player1' });
      mockWaitGame.getGames.mockReturnValue(new Map([['room1', mockGame]]));

      const handler = eventHandlers.get('checkGame')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'myGame',
        expect.objectContaining({
          player: expect.objectContaining({
            type: SINGLE,
          }),
        }),
      );
    });

    it('should emit endGame for MULTI lost player', () => {
      const mockPlayer = {
        getGrid: jest.fn().mockReturnValue([[]]),
        getPlayerName: jest.fn().mockReturnValue('Player1'),
        getUuid: jest.fn().mockReturnValue('uuid1'),
        getTetrominos: jest.fn().mockReturnValue([1, 2, 3, 4, 5, 6]),
      };
      const mockGame = {
        getType: jest.fn().mockReturnValue(MULTI),
        getPlayers: jest.fn().mockReturnValue([]),
        getIsStarted: jest.fn().mockReturnValue(false),
        getLostPlayers: jest.fn().mockReturnValue([mockPlayer]),
        getWaitingPlayers: jest.fn().mockReturnValue([]),
      };
      mockManageSocket.getInfos.mockReturnValue({ name: 'Player1' });
      mockWaitGame.getGames.mockReturnValue(new Map([['room1', mockGame]]));

      const handler = eventHandlers.get('checkGame')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'endGame',
        expect.objectContaining({
          player: expect.objectContaining({
            type: MULTI,
          }),
        }),
      );
    });

    it('should emit endGame with winner for MULTI winner player', () => {
      const mockPlayer = {
        getGrid: jest.fn().mockReturnValue([[]]),
        getPlayerName: jest.fn().mockReturnValue('Player1'),
        getUuid: jest.fn().mockReturnValue('uuid1'),
        getTetrominos: jest.fn().mockReturnValue([1, 2, 3, 4, 5, 6]),
      };
      const mockGame = {
        getType: jest.fn().mockReturnValue(MULTI),
        getPlayers: jest.fn().mockReturnValue([mockPlayer]),
        getIsStarted: jest.fn().mockReturnValue(false),
        getLostPlayers: jest.fn().mockReturnValue([]),
        getWaitingPlayers: jest.fn().mockReturnValue([]),
      };
      mockManageSocket.getInfos.mockReturnValue({ name: 'Player1' });
      mockWaitGame.getGames.mockReturnValue(new Map([['room1', mockGame]]));

      const handler = eventHandlers.get('checkGame')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'endGame',
        expect.objectContaining({
          player: expect.objectContaining({
            winner: true,
          }),
        }),
      );
    });

    it('should emit noGame if MULTI not started and player not found', () => {
      const mockGame = {
        getType: jest.fn().mockReturnValue(MULTI),
        getPlayers: jest.fn().mockReturnValue([]),
        getIsStarted: jest.fn().mockReturnValue(false),
        getLostPlayers: jest.fn().mockReturnValue([]),
        getWaitingPlayers: jest.fn().mockReturnValue([]),
      };
      mockManageSocket.getInfos.mockReturnValue({ name: 'Player1' });
      mockWaitGame.getGames.mockReturnValue(new Map([['room1', mockGame]]));

      const handler = eventHandlers.get('checkGame')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });

      expect(mockSocket.emit).toHaveBeenCalledWith('noGame');
    });

    it('should return early if data is invalid', () => {
      const handler = eventHandlers.get('checkGame')!;
      handler(undefined);
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('should return early if infos is undefined', () => {
      mockManageSocket.getInfos.mockReturnValue(undefined);
      const handler = eventHandlers.get('checkGame')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });

  describe('getWaitingList', () => {
    it('should emit list of waiting players', () => {
      const mockGame = {
        getWaitingPlayers: jest.fn().mockReturnValue([
          { getPlayerName: jest.fn().mockReturnValue('P1') },
          { getPlayerName: jest.fn().mockReturnValue('P2') },
        ]),
      };
      mockManageSocket.getInfos.mockReturnValue({ name: 'Player1' });
      mockWaitGame.getGames.mockReturnValue(new Map([['room1', mockGame]]));

      const handler = eventHandlers.get('getWaitingList')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });

      expect(mockSocket.emit).toHaveBeenCalledWith('list_players_room', {
        roomId: 'room1',
        players: ['P1', 'P2'],
      });
    });

    it('should return early if infos undefined', () => {
      mockManageSocket.getInfos.mockReturnValue(undefined);
      const handler = eventHandlers.get('getWaitingList')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });

  describe('notRetryGame', () => {
    it('should call waitGame.notRetryGame', () => {
      mockManageSocket.getInfos.mockReturnValue({ name: 'Player1' });
      const handler = eventHandlers.get('notRetryGame')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });
      expect(mockWaitGame.notRetryGame).toHaveBeenCalledWith(
        'uuid1',
        'Player1',
        'socketId1',
        'room1',
      );
    });

    it('should return early if infos undefined', () => {
      mockManageSocket.getInfos.mockReturnValue(undefined);
      const handler = eventHandlers.get('notRetryGame')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });
      expect(mockWaitGame.notRetryGame).not.toHaveBeenCalled();
    });
  });

  describe('retryGame', () => {
    it('should call waitGame.retryGame', () => {
      mockManageSocket.getInfos.mockReturnValue({ name: 'Player1' });
      const handler = eventHandlers.get('retryGame')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });
      expect(mockWaitGame.retryGame).toHaveBeenCalledWith(
        'uuid1',
        'Player1',
        'socketId1',
        'room1',
      );
    });
  });

  describe('startSingleTetrisGame', () => {
    it('should call waitGame.startSingleTetrisGame', () => {
      mockManageSocket.getInfos.mockReturnValue({ name: 'Player1' });
      const handler = eventHandlers.get('startSingleTetrisGame')!;
      handler({ uuid: 'uuid1' });
      expect(mockWaitGame.startSingleTetrisGame).toHaveBeenCalledWith(
        'uuid1',
        'Player1',
        'socketId1',
      );
    });

    it('should return early if infos undefined', () => {
      mockManageSocket.getInfos.mockReturnValue(undefined);
      const handler = eventHandlers.get('startSingleTetrisGame')!;
      handler({ uuid: 'uuid1' });
      expect(mockWaitGame.startSingleTetrisGame).not.toHaveBeenCalled();
    });
  });

  describe('startMultiGame', () => {
    it('should call waitGame.startMultiTetrisGame', () => {
      mockManageSocket.getInfos.mockReturnValue({ name: 'Player1' });
      const handler = eventHandlers.get('startMultiGame')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });
      expect(mockWaitGame.startMultiTetrisGame).toHaveBeenCalledWith(
        'uuid1',
        'Player1',
        'socketId1',
        'room1',
      );
    });
  });
});
