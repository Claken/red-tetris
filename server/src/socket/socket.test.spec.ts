import { Test, TestingModule } from '@nestjs/testing';
import { SocketService } from './socket.service';
import { Socket } from 'socket.io';

describe('SocketService', () => {
  let service: SocketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocketService],
    }).compile();

    service = module.get<SocketService>(SocketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add a client on connection', () => {
    // Créez une fausse instance de socket
    const socket: any = {
      id: 'fake-socket-id',
      on: jest.fn(),
    };

    // Appelez la méthode de connexion
    service.handleConnection(socket);

    // Vérifiez que le client a bien été ajouté à la map
    expect(service['connectedClients'].size).toBe(1);
    expect(service['connectedClients'].get('fake-socket-id')).toBe(socket);
  });

  it('should remove a client on disconnect', () => {
    // Créez une fausse instance de socket
    const socket: any = {
      id: 'fake-socket-id',
      on: jest.fn(),
    };

    // Appelez la méthode de connexion
    service.handleConnection(socket);

    // Simuler la déconnexion
    socket.on.mock.calls[0][1](); // appelle le callback de "disconnect"

    // Vérifiez que le client a bien été supprimé
    expect(service['connectedClients'].size).toBe(0);
  });
});
