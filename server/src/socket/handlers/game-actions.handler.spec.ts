import { Socket } from 'socket.io';
import { registerGameActionsHandlers } from './game-actions.handler';
import { HandlerContext } from '../handler-context';

describe('GameActionsHandler', () => {
  let mockSocket: jest.Mocked<Socket>;
  let ctx: HandlerContext;
  let eventHandlers: Map<string, Function>;
  let mockGame: any;
  let mockWaitGame: any;

  beforeEach(() => {
    eventHandlers = new Map();
    mockSocket = {
      on: jest.fn((event: string, handler: Function) => {
        eventHandlers.set(event, handler);
      }),
    } as unknown as jest.Mocked<Socket>;

    mockGame = {
      moveRight: jest.fn(),
      moveLeft: jest.fn(),
      rotate: jest.fn(),
      moveDown: jest.fn(),
      fallDown: jest.fn(),
    };

    mockWaitGame = {
      getUUIDMapings: jest.fn().mockReturnValue(
        new Map([
          [
            'uuid1',
            {
              socketsId: ['socket1'],
              ownedRoomsId: [],
              otherRoomsId: [],
              lobbyRoomsId: [],
              name: 'player1',
            },
          ],
        ]),
      ),
      getGames: jest
        .fn()
        .mockReturnValue(new Map([['room1', mockGame]])),
    };

    ctx = {
      waitGame: mockWaitGame,
      manageSocket: {} as any,
      isValidData: jest.fn(
        (data: any, ...fields: string[]) =>
          data != undefined && fields.every((f) => data[f] != undefined),
      ),
    };

    registerGameActionsHandlers(mockSocket, ctx);
  });

  describe('moveRight', () => {
    it('should call game.moveRight with valid data', () => {
      const handler = eventHandlers.get('moveRight')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });
      expect(mockGame.moveRight).toHaveBeenCalledWith('uuid1', ['socket1']);
    });

    it('should return early if data is invalid', () => {
      const handler = eventHandlers.get('moveRight')!;
      handler(undefined);
      expect(mockGame.moveRight).not.toHaveBeenCalled();
    });

    it('should return early if uuid not found in mappings', () => {
      const handler = eventHandlers.get('moveRight')!;
      handler({ uuid: 'unknown', roomId: 'room1' });
      expect(mockGame.moveRight).not.toHaveBeenCalled();
    });

    it('should return early if game not found', () => {
      const handler = eventHandlers.get('moveRight')!;
      handler({ uuid: 'uuid1', roomId: 'unknown-room' });
      expect(mockGame.moveRight).not.toHaveBeenCalled();
    });
  });

  describe('moveLeft', () => {
    it('should call game.moveLeft with valid data', () => {
      const handler = eventHandlers.get('moveLeft')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });
      expect(mockGame.moveLeft).toHaveBeenCalledWith('uuid1', ['socket1']);
    });

    it('should return early if data is invalid', () => {
      const handler = eventHandlers.get('moveLeft')!;
      handler(undefined);
      expect(mockGame.moveLeft).not.toHaveBeenCalled();
    });
  });

  describe('rotate', () => {
    it('should call game.rotate with valid data', () => {
      const handler = eventHandlers.get('rotate')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });
      expect(mockGame.rotate).toHaveBeenCalledWith('uuid1', ['socket1']);
    });

    it('should return early if infos is undefined', () => {
      const handler = eventHandlers.get('rotate')!;
      handler({ uuid: 'unknown', roomId: 'room1' });
      expect(mockGame.rotate).not.toHaveBeenCalled();
    });
  });

  describe('moveDown', () => {
    it('should call game.moveDown with valid data', () => {
      const handler = eventHandlers.get('moveDown')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });
      expect(mockGame.moveDown).toHaveBeenCalledWith('uuid1', ['socket1']);
    });

    it('should return early if game is undefined', () => {
      const handler = eventHandlers.get('moveDown')!;
      handler({ uuid: 'uuid1', roomId: 'nonexistent' });
      expect(mockGame.moveDown).not.toHaveBeenCalled();
    });
  });

  describe('fallDown', () => {
    it('should call game.fallDown with valid data', () => {
      const handler = eventHandlers.get('fallDown')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });
      expect(mockGame.fallDown).toHaveBeenCalledWith('uuid1', ['socket1']);
    });

    it('should return early if data is invalid', () => {
      const handler = eventHandlers.get('fallDown')!;
      handler({ uuid: undefined, roomId: 'room1' });
      expect(mockGame.fallDown).not.toHaveBeenCalled();
    });
  });
});
