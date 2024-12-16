import { Test, TestingModule } from '@nestjs/testing';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { Server, Socket } from 'socket.io';
import { WaitGame } from '../../class/waitGame/waitGame';
import { ManageSocket } from '../../class/manageSocket/manageSocket';
import { SINGLE } from '../../constantes/constantes';
import { Game } from '../../class/game/game';
import { Player } from '../../class/player/player';

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

  it('should handle "getWaitingList" event correctly', () => {
    const data = { uuid: 'uuid123', roomId: 'roomId123' };

    const mockSocket = {
      emit: jest.fn(),
      on: jest.fn(),
    } as unknown as Socket;

    const mockPlayer = {
      getPlayerName: jest.fn().mockReturnValue('Player1'),
    } as unknown as Player;

    const mockGameInstance = {
      get_waitingPlayers: jest.fn().mockReturnValue([mockPlayer]),
    } as unknown as Game;

    const mockWaitGame = {
      getGames: jest
        .fn()
        .mockReturnValue(new Map([[data.roomId, mockGameInstance]])),
    } as unknown as WaitGame;

    const mockManageSocket = {
      getInfos: jest.fn().mockReturnValue({ uuid: data.uuid }),
    } as unknown as ManageSocket;

    // Mock des instances dans le gateway
    (gateway as any)['waitGame'] = mockWaitGame;
    (gateway as any)['manageSocket'] = mockManageSocket;

    // Simule l'enregistrement de l'événement
    gateway['listenToEmmitter'](mockSocket);

    // Récupère le callback enregistré pour 'getWaitingList'
    const getWaitingListCallback = (mockSocket.on as jest.Mock).mock.calls.find(
      ([event]) => event === 'getWaitingList',
    )[1];

    // Appelle le callback avec les données simulées
    getWaitingListCallback(data);

    // Vérifie les appels attendus
    expect(mockManageSocket.getInfos).toHaveBeenCalledWith(data.uuid);
    expect(mockWaitGame.getGames).toHaveBeenCalled();
    expect(mockGameInstance.get_waitingPlayers).toHaveBeenCalled();
    expect(mockSocket.emit).toHaveBeenCalledWith('list_players_room', {
      roomId: data.roomId,
      players: ['Player1'],
    });
  });

  it('should handle "notRetryGame" event correctly', () => {
    const data = { uuid: 'uuid123', roomId: 'roomId123' };

    // Mock du socket
    const mockSocket = {
      id: 'socketId123',
      on: jest.fn(),
      emit: jest.fn(),
    } as unknown as Socket;

    // Mock de `ManageSocket`
    const mockManageSocket = {
      getInfos: jest.fn(),
    } as unknown as ManageSocket;
    (gateway as any).manageSocket = mockManageSocket;

    // Mock de `WaitGame`
    const mockWaitGame = {
      notRetryGame: jest.fn(),
    } as unknown as WaitGame;
    (gateway as any).waitGame = mockWaitGame;

    // Simule l'enregistrement de l'événement
    gateway['listenToEmmitter'](mockSocket);

    // Récupère le callback enregistré pour `notRetryGame`
    const notRetryGameCallback = (mockSocket.on as jest.Mock).mock.calls.find(
      ([event]) => event === 'notRetryGame',
    )[1];

    // Cas 1 : `getInfos` retourne undefined
    jest.spyOn(mockManageSocket, 'getInfos').mockReturnValueOnce(undefined);
    notRetryGameCallback(data);

    expect(mockManageSocket.getInfos).toHaveBeenCalledWith(data.uuid);
    expect(mockWaitGame.notRetryGame).not.toHaveBeenCalled();

    // Cas 2 : `getInfos` retourne un joueur valide
    const infos = {
      uuid: data.uuid,
      roomId: data.roomId,
      name: 'TestName',
      sockets: [mockSocket],
    };
    jest.spyOn(mockManageSocket, 'getInfos').mockReturnValueOnce(infos);
    notRetryGameCallback(data);

    expect(mockWaitGame.notRetryGame).toHaveBeenCalledWith(
      data.uuid,
      infos.name,
      mockSocket.id,
      data.roomId,
    );
  });

  it('should handle "retryGame" event correctly', () => {
    const data = { uuid: 'uuid123', roomId: 'roomId123' };

    // Mock du socket
    const mockSocket = {
      id: 'socketId123',
      on: jest.fn(),
      emit: jest.fn(),
    } as unknown as Socket;

    // Mock de `ManageSocket`
    const mockManageSocket = {
      getInfos: jest.fn(),
    } as unknown as ManageSocket;
    (gateway as any).manageSocket = mockManageSocket;

    // Mock de `WaitGame`
    const mockWaitGame = {
      retryGame: jest.fn(),
    } as unknown as WaitGame;
    (gateway as any).waitGame = mockWaitGame;

    // Simule l'enregistrement de l'événement
    gateway['listenToEmmitter'](mockSocket);

    // Récupère le callback enregistré pour `retryGame`
    const retryGameCallback = (mockSocket.on as jest.Mock).mock.calls.find(
      ([event]) => event === 'retryGame',
    )[1];

    // Cas 1 : `getInfos` retourne undefined
    jest.spyOn(mockManageSocket, 'getInfos').mockReturnValueOnce(undefined);
    retryGameCallback(data);

    expect(mockManageSocket.getInfos).toHaveBeenCalledWith(data.uuid);
    expect(mockWaitGame.retryGame).not.toHaveBeenCalled();

    // Cas 2 : `getInfos` retourne un joueur valide
    const infos = {
      uuid: data.uuid,
      roomId: data.roomId,
      name: 'TestName',
      sockets: [mockSocket],
    };
    jest.spyOn(mockManageSocket, 'getInfos').mockReturnValueOnce(infos);
    retryGameCallback(data);

    expect(mockWaitGame.retryGame).toHaveBeenCalledWith(
      data.uuid,
      infos.name,
      mockSocket.id,
      data.roomId,
    );
  });

  it('should handle "startSingleTetrisGame" event correctly', () => {
    const data = { uuid: 'uuid123', roomId: 'roomId123' };

    // Mock du socket
    const mockSocket = {
      id: 'socketId123',
      on: jest.fn(),
      emit: jest.fn(),
    } as unknown as Socket;

    // Mock de `ManageSocket`
    const mockManageSocket = {
      getInfos: jest.fn(),
    } as unknown as ManageSocket;
    (gateway as any).manageSocket = mockManageSocket;

    // Mock de `WaitGame`
    const mockWaitGame = {
      startSingleTetrisGame: jest.fn(),
    } as unknown as WaitGame;
    (gateway as any).waitGame = mockWaitGame;

    // Simule l'enregistrement de l'événement
    gateway['listenToEmmitter'](mockSocket);

    // Récupère le callback enregistré pour `retryGame`
    const startSingleTetrisGame = (mockSocket.on as jest.Mock).mock.calls.find(
      ([event]) => event === 'startSingleTetrisGame',
    )[1];

    // Cas 1 : `getInfos` retourne undefined
    jest.spyOn(mockManageSocket, 'getInfos').mockReturnValueOnce(undefined);
    startSingleTetrisGame(data);

    expect(mockManageSocket.getInfos).toHaveBeenCalledWith(data.uuid);
    expect(mockWaitGame.startSingleTetrisGame).not.toHaveBeenCalled();

    // Cas 2 : `getInfos` retourne un joueur valide
    const infos = {
      uuid: data.uuid,
      roomId: data.roomId,
      name: 'TestName',
      sockets: [mockSocket],
    };
    jest.spyOn(mockManageSocket, 'getInfos').mockReturnValueOnce(infos);
    startSingleTetrisGame(data);

    expect(mockWaitGame.startSingleTetrisGame).toHaveBeenCalledWith(
      data.uuid,
      infos.name,
      mockSocket.id,
    );
  });

  it('should handle "startMultiGame" event correctly', () => {
    const data = { uuid: 'uuid123', roomId: 'roomId123' };

    // Mock du socket
    const mockSocket = {
      id: 'socketId123',
      on: jest.fn(),
      emit: jest.fn(),
    } as unknown as Socket;

    // Mock de `ManageSocket`
    const mockManageSocket = {
      getInfos: jest.fn(),
    } as unknown as ManageSocket;
    (gateway as any).manageSocket = mockManageSocket;

    // Mock de `WaitGame`
    const mockWaitGame = {
      startMultiTetrisGame: jest.fn(),
    } as unknown as WaitGame;
    (gateway as any).waitGame = mockWaitGame;

    // Simule l'enregistrement de l'événement
    gateway['listenToEmmitter'](mockSocket);

    // Récupère le callback enregistré pour `retryGame`
    const startMultiTetrisGameCallBack = (
      mockSocket.on as jest.Mock
    ).mock.calls.find(([event]) => event === 'startMultiGame')[1];

    // Cas 1 : `getInfos` retourne undefined
    jest.spyOn(mockManageSocket, 'getInfos').mockReturnValueOnce(undefined);
    startMultiTetrisGameCallBack(data);

    expect(mockManageSocket.getInfos).toHaveBeenCalledWith(data.uuid);
    expect(mockWaitGame.startMultiTetrisGame).not.toHaveBeenCalled();

    // Cas 2 : `getInfos` retourne un joueur valide
    const infos = {
      uuid: data.uuid,
      roomId: data.roomId,
      name: 'TestName',
      sockets: [mockSocket],
    };
    jest.spyOn(mockManageSocket, 'getInfos').mockReturnValueOnce(infos);
    startMultiTetrisGameCallBack(data);

    expect(mockWaitGame.startMultiTetrisGame).toHaveBeenCalledWith(
      data.uuid,
      infos.name,
      mockSocket.id,
      data.roomId,
    );
  });
});
