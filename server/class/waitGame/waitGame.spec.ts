import { Server } from 'socket.io';
import { WaitGame } from './waitGame';

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
});
