import { Test, TestingModule } from '@nestjs/testing';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { Server, Socket } from 'socket.io';
import { WaitGame } from '../../class/waitGame/waitGame';
import { ManageSocket } from '../../class/manageSocket/manageSocket';
import { SINGLE } from '../../constantes/constantes';
import { Game } from '../../class/game/game';

jest.mock('./socket.service');

describe('SocketGateway', () => {
  let gateway: SocketGateway;
  let mockServer: Server;
  let mockSocket: Socket;
  let socketService: SocketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocketGateway, SocketService],
    }).compile();

    gateway = module.get<SocketGateway>(SocketGateway);
    socketService = module.get<SocketService>(SocketService);

    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as unknown as Server;

    mockSocket = {
      id: 'socket-id',
      emit: jest.fn(),
      on: jest.fn(),
      join: jest.fn(),
      disconnect: jest.fn(),
    } as unknown as Socket;

    gateway.afterInit();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should initialize WaitGame and ManageSocket', () => {
    const mockWaitGameInstance = {} as WaitGame;

    const waitGameSpy = jest
      .spyOn(WaitGame, 'getInstance')
      .mockImplementation((server: Server) => mockWaitGameInstance);

    const mockManageSocketInstance = {} as ManageSocket;
    const manageSocketSpy = jest
      .spyOn(ManageSocket, 'getInstance')
      .mockReturnValueOnce(mockManageSocketInstance);

    const gateway = new SocketGateway(socketService);
    gateway.afterInit();

    expect(waitGameSpy).toHaveBeenCalledWith(gateway['server']);
    expect(manageSocketSpy).toHaveBeenCalled();
  });

  it('should handle connection and set up socket listener', () => {
    const uuid = 'uuid123';
    const name = 'Player1';

    const mockSocket = {
      handshake: {
        query: {
          name,
          uuid,
        },
      },
      id: 'socketId123',
      emit: jest.fn(),
      join: jest.fn(),
      on: jest.fn(),
    } as unknown as Socket;

    const mockWaitGameInstance = {
      addSocket: jest.fn(),
    } as unknown as WaitGame;

    const mockManageSocketInstance = {
      add: jest.fn(),
    } as unknown as ManageSocket;

    const waitGameSpy = jest
      .spyOn(WaitGame, 'getInstance')
      .mockImplementation(() => mockWaitGameInstance);

    const manageSocketSpy = jest
      .spyOn(ManageSocket, 'getInstance')
      .mockReturnValue(mockManageSocketInstance);

    const gateway = new SocketGateway(socketService);
    gateway.afterInit();

    gateway.handleConnection(mockSocket);

    expect(mockManageSocketInstance.add).toHaveBeenCalledWith(
      mockSocket,
      name,
      uuid,
    );
    expect(mockWaitGameInstance.addSocket).toHaveBeenCalledWith(
      uuid,
      mockSocket.id,
    );
    expect(waitGameSpy).toHaveBeenCalled();
    expect(manageSocketSpy).toHaveBeenCalled();

    expect(mockSocket.on).toHaveBeenCalledWith(
      'checkGame',
      expect.any(Function),
    );
  });

  it('should handle disconnect and delete socket correctly', () => {
    const mockSocket = {
      id: 'socketId123',
      emit: jest.fn(),
      join: jest.fn(),
      on: jest.fn(),
    } as unknown as Socket;

    const mockWaitGameInstance = {
      deleteSocket: jest.fn(),
    } as unknown as WaitGame;

    const mockManageSocketInstance = {
      deleteSocket: jest.fn(),
    } as unknown as ManageSocket;

    const waitGameSpy = jest
      .spyOn(WaitGame, 'getInstance')
      .mockImplementation(() => mockWaitGameInstance);

    const manageSocketSpy = jest
      .spyOn(ManageSocket, 'getInstance')
      .mockReturnValue(mockManageSocketInstance);

    const gateway = new SocketGateway(socketService);
    gateway.afterInit();

    gateway.handleDisconnect(mockSocket);

    expect(mockWaitGameInstance.deleteSocket).toHaveBeenCalledWith(
      mockSocket.id,
    );

    expect(mockManageSocketInstance.deleteSocket).toHaveBeenCalledWith(
      mockSocket,
    );

    expect(waitGameSpy).toHaveBeenCalled();
    expect(manageSocketSpy).toHaveBeenCalled();
  });

  it('should handle "checkGame" event correctly', () => {
    const data = { uuid: 'uuid123', roomId: 'roomId123' };

    const mockGameInstance = {
      getType: jest.fn().mockReturnValue(SINGLE),
      getPlayers: jest.fn().mockReturnValue([
        {
          getGrid: jest.fn(),
          getPlayerName: jest.fn(),
          getUuid: jest.fn(),
          getTetrominos: jest.fn().mockReturnValue([1, 2, 3, 4, 5]),
        },
      ]),
    } as unknown as Game;

    const mockWaitGame = {
      getGames: jest
        .fn()
        .mockReturnValue(new Map([[data.roomId, mockGameInstance]])),
    } as unknown as WaitGame;

    (gateway as any)['waitGame'] = mockWaitGame;

    const mockManageSocket = {
      getInfos: jest.fn(),
    } as unknown as (typeof gateway)['manageSocket'];
    (gateway as any)['manageSocket'] = mockManageSocket;

    const infos = { uuid: data.uuid, name: 'TestName', sockets: [mockSocket] };
    jest.spyOn(mockManageSocket, 'getInfos').mockReturnValue(infos);

    (gateway as any).listenToEmmitter(mockSocket);

    const checkGameCallback = (mockSocket.on as jest.Mock).mock.calls.find(
      ([event]) => event === 'checkGame',
    )[1];
    checkGameCallback(data);

    expect(mockSocket.emit).toHaveBeenCalledWith('myGame', expect.any(Object));
  });
});
