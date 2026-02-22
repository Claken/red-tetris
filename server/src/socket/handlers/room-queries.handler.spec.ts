import { Socket } from 'socket.io';
import { registerRoomQueriesHandlers } from './room-queries.handler';
import { HandlerContext } from '../handler-context';
import { MULTI, SINGLE } from '../../../constantes/constantes';

describe('RoomQueriesHandler', () => {
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
      join: jest.fn(),
    } as unknown as jest.Mocked<Socket>;

    mockWaitGame = {
      getUUIDMapings: jest.fn(),
      getGames: jest.fn(),
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

    registerRoomQueriesHandlers(mockSocket, ctx);
  });

  describe('getActiveRooms', () => {
    it('should return active rooms for the user', () => {
      const mockGame = {
        getIsStarted: jest.fn().mockReturnValue(true),
        getLostPlayers: jest.fn().mockReturnValue([]),
      };
      const infos = {
        socketsId: ['socketId1'],
        ownedRoomsId: ['room1'],
        otherRoomsId: ['room2'],
        lobbyRoomsId: [],
        name: 'player1',
      };
      mockWaitGame.getUUIDMapings.mockReturnValue(
        new Map([['uuid1', infos]]),
      );
      mockWaitGame.getGames.mockReturnValue(
        new Map([
          ['room1', mockGame],
          ['room2', mockGame],
        ]),
      );

      const handler = eventHandlers.get('getActiveRooms')!;
      handler({ uuid: 'uuid1' });

      expect(mockSocket.join).toHaveBeenCalledWith('room1');
      expect(mockSocket.join).toHaveBeenCalledWith('room2');
      expect(mockSocket.emit).toHaveBeenCalledWith('getActiveRooms', {
        activeRooms: ['room1', 'room2'],
      });
    });

    it('should exclude rooms where player has lost', () => {
      const mockGame = {
        getIsStarted: jest.fn().mockReturnValue(true),
        getLostPlayers: jest.fn().mockReturnValue([
          { getUuid: () => 'uuid1' },
        ]),
      };
      const infos = {
        socketsId: ['socketId1'],
        ownedRoomsId: ['room1'],
        otherRoomsId: [],
        lobbyRoomsId: [],
        name: 'player1',
      };
      mockWaitGame.getUUIDMapings.mockReturnValue(
        new Map([['uuid1', infos]]),
      );
      mockWaitGame.getGames.mockReturnValue(new Map([['room1', mockGame]]));

      const handler = eventHandlers.get('getActiveRooms')!;
      handler({ uuid: 'uuid1' });

      expect(mockSocket.emit).toHaveBeenCalledWith('getActiveRooms', {
        activeRooms: [],
      });
    });

    it('should return early if data is undefined', () => {
      const handler = eventHandlers.get('getActiveRooms')!;
      handler(undefined);
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('should return early if uuid is undefined', () => {
      const handler = eventHandlers.get('getActiveRooms')!;
      handler({ uuid: undefined });
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('should return early if infos not found', () => {
      mockWaitGame.getUUIDMapings.mockReturnValue(new Map());
      const handler = eventHandlers.get('getActiveRooms')!;
      handler({ uuid: 'uuid1' });
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('should add socketId if not already present', () => {
      const infos = {
        socketsId: ['otherSocket'],
        ownedRoomsId: [],
        otherRoomsId: [],
        lobbyRoomsId: [],
        name: 'player1',
      };
      mockWaitGame.getUUIDMapings.mockReturnValue(
        new Map([['uuid1', infos]]),
      );
      mockWaitGame.getGames.mockReturnValue(new Map());

      const handler = eventHandlers.get('getActiveRooms')!;
      handler({ uuid: 'uuid1' });

      expect(infos.socketsId).toContain('socketId1');
    });

    it('should skip non-started rooms', () => {
      const mockGame = {
        getIsStarted: jest.fn().mockReturnValue(false),
        getLostPlayers: jest.fn().mockReturnValue([]),
      };
      const infos = {
        socketsId: ['socketId1'],
        ownedRoomsId: ['room1'],
        otherRoomsId: [],
        lobbyRoomsId: [],
        name: 'player1',
      };
      mockWaitGame.getUUIDMapings.mockReturnValue(
        new Map([['uuid1', infos]]),
      );
      mockWaitGame.getGames.mockReturnValue(new Map([['room1', mockGame]]));

      const handler = eventHandlers.get('getActiveRooms')!;
      handler({ uuid: 'uuid1' });

      expect(mockSocket.emit).toHaveBeenCalledWith('getActiveRooms', {
        activeRooms: [],
      });
    });
  });

  describe('getCreateRooms', () => {
    it('should return created multi rooms that are not started', () => {
      const mockGame = {
        getType: jest.fn().mockReturnValue(MULTI),
        getIsStarted: jest.fn().mockReturnValue(false),
      };
      const infos = {
        socketsId: ['socketId1'],
        ownedRoomsId: ['room1'],
        otherRoomsId: ['room2'],
        lobbyRoomsId: [],
        name: 'player1',
      };
      mockWaitGame.getUUIDMapings.mockReturnValue(
        new Map([['uuid1', infos]]),
      );
      mockWaitGame.getGames.mockReturnValue(new Map([['room1', mockGame]]));

      const handler = eventHandlers.get('getCreateRooms')!;
      handler({ uuid: 'uuid1' });

      expect(mockSocket.emit).toHaveBeenCalledWith('getCreateRooms', {
        createRooms: ['room1'],
      });
    });

    it('should return early if data is undefined', () => {
      const handler = eventHandlers.get('getCreateRooms')!;
      handler(undefined);
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('should return early if infos not found', () => {
      mockWaitGame.getUUIDMapings.mockReturnValue(new Map());
      const handler = eventHandlers.get('getCreateRooms')!;
      handler({ uuid: 'uuid1' });
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('should add socketId if not already present', () => {
      const infos = {
        socketsId: ['other'],
        ownedRoomsId: [],
        otherRoomsId: [],
        lobbyRoomsId: [],
        name: 'player1',
      };
      mockWaitGame.getUUIDMapings.mockReturnValue(
        new Map([['uuid1', infos]]),
      );
      mockWaitGame.getGames.mockReturnValue(new Map());

      const handler = eventHandlers.get('getCreateRooms')!;
      handler({ uuid: 'uuid1' });

      expect(infos.socketsId).toContain('socketId1');
    });

    it('should exclude started or single rooms', () => {
      const startedGame = {
        getType: jest.fn().mockReturnValue(MULTI),
        getIsStarted: jest.fn().mockReturnValue(true),
      };
      const singleGame = {
        getType: jest.fn().mockReturnValue(SINGLE),
        getIsStarted: jest.fn().mockReturnValue(false),
      };
      const infos = {
        socketsId: ['socketId1'],
        ownedRoomsId: ['room1', 'room2'],
        otherRoomsId: [],
        lobbyRoomsId: [],
        name: 'player1',
      };
      mockWaitGame.getUUIDMapings.mockReturnValue(
        new Map([['uuid1', infos]]),
      );
      mockWaitGame.getGames.mockReturnValue(
        new Map([
          ['room1', startedGame],
          ['room2', singleGame],
        ]),
      );

      const handler = eventHandlers.get('getCreateRooms')!;
      handler({ uuid: 'uuid1' });

      expect(mockSocket.emit).toHaveBeenCalledWith('getCreateRooms', {
        createRooms: [],
      });
    });
  });

  describe('getOtherRooms', () => {
    it('should return available rooms not owned or joined', () => {
      const mockGame = {
        getType: jest.fn().mockReturnValue(MULTI),
        getRoomId: jest.fn().mockReturnValue('room1'),
        getIsStarted: jest.fn().mockReturnValue(false),
      };
      mockManageSocket.getInfos.mockReturnValue({ name: 'player1' });
      mockWaitGame.getGames.mockReturnValue(new Map([['room1', mockGame]]));
      mockWaitGame.getUUIDMapings.mockReturnValue(new Map());

      const handler = eventHandlers.get('getOtherRooms')!;
      handler({ uuid: 'uuid1' });

      expect(mockSocket.emit).toHaveBeenCalledWith('getOtherRooms', {
        otherRooms: [{ roomId: 'room1', isStarted: false }],
      });
    });

    it('should exclude rooms the player owns', () => {
      const mockGame = {
        getType: jest.fn().mockReturnValue(MULTI),
        getRoomId: jest.fn().mockReturnValue('room1'),
        getIsStarted: jest.fn().mockReturnValue(false),
      };
      const infos = {
        socketsId: [],
        ownedRoomsId: ['room1'],
        otherRoomsId: [],
        lobbyRoomsId: [],
        name: 'player1',
      };
      mockManageSocket.getInfos.mockReturnValue({ name: 'player1' });
      mockWaitGame.getGames.mockReturnValue(new Map([['room1', mockGame]]));
      mockWaitGame.getUUIDMapings.mockReturnValue(
        new Map([['uuid1', infos]]),
      );

      const handler = eventHandlers.get('getOtherRooms')!;
      handler({ uuid: 'uuid1' });

      expect(mockSocket.emit).toHaveBeenCalledWith('getOtherRooms', {
        otherRooms: [],
      });
    });

    it('should return early if data is undefined', () => {
      const handler = eventHandlers.get('getOtherRooms')!;
      handler(undefined);
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('should return early if player infos not found', () => {
      mockManageSocket.getInfos.mockReturnValue(undefined);
      const handler = eventHandlers.get('getOtherRooms')!;
      handler({ uuid: 'uuid1' });
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('should exclude SINGLE rooms', () => {
      const mockGame = {
        getType: jest.fn().mockReturnValue(SINGLE),
        getRoomId: jest.fn().mockReturnValue('room1'),
        getIsStarted: jest.fn().mockReturnValue(false),
      };
      mockManageSocket.getInfos.mockReturnValue({ name: 'player1' });
      mockWaitGame.getGames.mockReturnValue(new Map([['room1', mockGame]]));
      mockWaitGame.getUUIDMapings.mockReturnValue(new Map());

      const handler = eventHandlers.get('getOtherRooms')!;
      handler({ uuid: 'uuid1' });

      expect(mockSocket.emit).toHaveBeenCalledWith('getOtherRooms', {
        otherRooms: [],
      });
    });
  });

  describe('getOthersRoomsJoined', () => {
    it('should return joined multi rooms that are not started', () => {
      const mockGame = {
        getType: jest.fn().mockReturnValue(MULTI),
        getIsStarted: jest.fn().mockReturnValue(false),
      };
      const infos = {
        socketsId: ['socketId1'],
        ownedRoomsId: ['ownedRoom'],
        otherRoomsId: ['room1'],
        lobbyRoomsId: [],
        name: 'player1',
      };
      mockWaitGame.getUUIDMapings.mockReturnValue(
        new Map([['uuid1', infos]]),
      );
      mockWaitGame.getGames.mockReturnValue(
        new Map([['room1', mockGame]]),
      );

      const handler = eventHandlers.get('getOthersRoomsJoined')!;
      handler({ uuid: 'uuid1' });

      expect(mockSocket.join).toHaveBeenCalledWith('room1');
      expect(mockSocket.join).toHaveBeenCalledWith('ownedRoom');
      expect(mockSocket.emit).toHaveBeenCalledWith('getOthersRoomsJoined', {
        roomsJoined: ['room1'],
      });
    });

    it('should return early if data is undefined', () => {
      const handler = eventHandlers.get('getOthersRoomsJoined')!;
      handler(undefined);
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('should return early if infos not found', () => {
      mockWaitGame.getUUIDMapings.mockReturnValue(new Map());
      const handler = eventHandlers.get('getOthersRoomsJoined')!;
      handler({ uuid: 'uuid1' });
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('should add socketId if not already present', () => {
      const infos = {
        socketsId: ['other'],
        ownedRoomsId: [],
        otherRoomsId: [],
        lobbyRoomsId: [],
        name: 'player1',
      };
      mockWaitGame.getUUIDMapings.mockReturnValue(
        new Map([['uuid1', infos]]),
      );
      mockWaitGame.getGames.mockReturnValue(new Map());

      const handler = eventHandlers.get('getOthersRoomsJoined')!;
      handler({ uuid: 'uuid1' });

      expect(infos.socketsId).toContain('socketId1');
    });

    it('should exclude started rooms', () => {
      const mockGame = {
        getType: jest.fn().mockReturnValue(MULTI),
        getIsStarted: jest.fn().mockReturnValue(true),
      };
      const infos = {
        socketsId: ['socketId1'],
        ownedRoomsId: [],
        otherRoomsId: ['room1'],
        lobbyRoomsId: [],
        name: 'player1',
      };
      mockWaitGame.getUUIDMapings.mockReturnValue(
        new Map([['uuid1', infos]]),
      );
      mockWaitGame.getGames.mockReturnValue(new Map([['room1', mockGame]]));

      const handler = eventHandlers.get('getOthersRoomsJoined')!;
      handler({ uuid: 'uuid1' });

      expect(mockSocket.emit).toHaveBeenCalledWith('getOthersRoomsJoined', {
        roomsJoined: [],
      });
    });
  });
});
