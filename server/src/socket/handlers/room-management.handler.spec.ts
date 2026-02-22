import { Socket } from 'socket.io';
import { registerRoomManagementHandlers } from './room-management.handler';
import { HandlerContext } from '../handler-context';

describe('RoomManagementHandler', () => {
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
      createGame: jest.fn(),
      joinGame: jest.fn(),
      joinRoom: jest.fn(),
      leaveRoom: jest.fn(),
      startRoom: jest.fn(),
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

    registerRoomManagementHandlers(mockSocket, ctx);
  });

  describe('createRoom', () => {
    it('should create a room with valid data', () => {
      mockManageSocket.getInfos.mockReturnValue({ name: 'Player1' });
      const handler = eventHandlers.get('createRoom')!;
      handler({ uuid: 'uuid1' });
      expect(mockWaitGame.createGame).toHaveBeenCalledWith(
        'uuid1',
        'Player1',
        'socketId1',
      );
    });

    it('should return early if data is invalid', () => {
      const handler = eventHandlers.get('createRoom')!;
      handler(undefined);
      expect(mockWaitGame.createGame).not.toHaveBeenCalled();
    });

    it('should return early if infos is undefined', () => {
      mockManageSocket.getInfos.mockReturnValue(undefined);
      const handler = eventHandlers.get('createRoom')!;
      handler({ uuid: 'uuid1' });
      expect(mockWaitGame.createGame).not.toHaveBeenCalled();
    });
  });

  describe('joinGame', () => {
    it('should join a game with valid data', () => {
      mockManageSocket.getInfos.mockReturnValue({ name: 'Player1' });
      const handler = eventHandlers.get('joinGame')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });
      expect(mockWaitGame.joinGame).toHaveBeenCalledWith(
        'uuid1',
        'Player1',
        'socketId1',
        'room1',
      );
    });

    it('should return early if infos is undefined', () => {
      mockManageSocket.getInfos.mockReturnValue(undefined);
      const handler = eventHandlers.get('joinGame')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });
      expect(mockWaitGame.joinGame).not.toHaveBeenCalled();
    });
  });

  describe('joinRoom', () => {
    it('should emit room_joined on success', () => {
      mockManageSocket.getInfos.mockReturnValue({ name: 'Player1' });
      mockWaitGame.joinRoom.mockReturnValue({ success: true });
      const handler = eventHandlers.get('joinRoom')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });
      expect(mockSocket.emit).toHaveBeenCalledWith('room_joined', {
        success: true,
        roomId: 'room1',
      });
    });

    it('should emit room_join_failed on failure', () => {
      mockManageSocket.getInfos.mockReturnValue({ name: 'Player1' });
      mockWaitGame.joinRoom.mockReturnValue({
        success: false,
        reason: 'name_taken',
      });
      const handler = eventHandlers.get('joinRoom')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });
      expect(mockSocket.emit).toHaveBeenCalledWith('room_join_failed', {
        reason: 'name_taken',
        roomId: 'room1',
      });
    });

    it('should return early if data is invalid', () => {
      const handler = eventHandlers.get('joinRoom')!;
      handler(undefined);
      expect(mockWaitGame.joinRoom).not.toHaveBeenCalled();
    });

    it('should return early if infos is undefined', () => {
      mockManageSocket.getInfos.mockReturnValue(undefined);
      const handler = eventHandlers.get('joinRoom')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });
      expect(mockWaitGame.joinRoom).not.toHaveBeenCalled();
    });
  });

  describe('leaveRoom', () => {
    it('should leave room and emit room_left', () => {
      mockManageSocket.getInfos.mockReturnValue({ name: 'Player1' });
      const handler = eventHandlers.get('leaveRoom')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });
      expect(mockWaitGame.leaveRoom).toHaveBeenCalledWith(
        'uuid1',
        'socketId1',
        'room1',
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('room_left', {
        success: true,
        roomId: 'room1',
      });
    });

    it('should return early if infos is undefined', () => {
      mockManageSocket.getInfos.mockReturnValue(undefined);
      const handler = eventHandlers.get('leaveRoom')!;
      handler({ uuid: 'uuid1', roomId: 'room1' });
      expect(mockWaitGame.leaveRoom).not.toHaveBeenCalled();
    });
  });

  describe('startRoom', () => {
    it('should start room successfully', async () => {
      mockManageSocket.getInfos.mockReturnValue({ name: 'Player1' });
      mockWaitGame.startRoom.mockResolvedValue({ success: true });
      const handler = eventHandlers.get('startRoom')!;
      await handler({ uuid: 'uuid1', roomId: 'room1' });
      expect(mockWaitGame.startRoom).toHaveBeenCalledWith(
        'uuid1',
        'Player1',
        'socketId1',
        'room1',
      );
      expect(mockSocket.emit).not.toHaveBeenCalledWith(
        'room_start_failed',
        expect.anything(),
      );
    });

    it('should emit room_start_failed on failure', async () => {
      mockManageSocket.getInfos.mockReturnValue({ name: 'Player1' });
      mockWaitGame.startRoom.mockResolvedValue({
        success: false,
        reason: 'not_host',
      });
      const handler = eventHandlers.get('startRoom')!;
      await handler({ uuid: 'uuid1', roomId: 'room1' });
      expect(mockSocket.emit).toHaveBeenCalledWith('room_start_failed', {
        reason: 'not_host',
        roomId: 'room1',
      });
    });

    it('should return early if infos is undefined', async () => {
      mockManageSocket.getInfos.mockReturnValue(undefined);
      const handler = eventHandlers.get('startRoom')!;
      await handler({ uuid: 'uuid1', roomId: 'room1' });
      expect(mockWaitGame.startRoom).not.toHaveBeenCalled();
    });
  });
});
