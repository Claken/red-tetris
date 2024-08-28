import { Test, TestingModule } from '@nestjs/testing';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { Socket } from 'socket.io';

describe('SocketGateway', () => {
  let gateway: SocketGateway;
  let socketService: SocketService;
  let mockSocket: Socket;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocketGateway, SocketService],
    }).compile();

    gateway = module.get<SocketGateway>(SocketGateway);
    socketService = module.get<SocketService>(SocketService);

    mockSocket = {
      id: 'testSocketId',
      emit: jest.fn(),
      on: jest.fn(),
      disconnect: jest.fn(),
    } as any; // Cast to any to mock the Socket type
  });

  it('should handle connection', () => {
    const spy = jest.spyOn(socketService, 'handleConnection');
    gateway.handleConnection(mockSocket);
    expect(spy).toHaveBeenCalledWith(mockSocket);
  });

  // Add more tests for different events or methods
});
