import { ManageSocket } from './manageSocket';
import { Socket } from 'socket.io';
import { IdentifierToSocket } from '../../interfaces/identifierToSocket';
import { v4 as uuidv4 } from 'uuid';

describe('ManageSocket', () => {
  it('should be created successfully', () => {
    const manageSocket = ManageSocket.getInstance();
    expect(manageSocket).toBeInstanceOf(ManageSocket);
  });

  it('should be a singleton', () => {
    const instance1 = ManageSocket.getInstance();
    const instance2 = ManageSocket.getInstance();
    expect(instance1).toBe(instance2);
  });

  describe('addNewUser()', () => {
    it('should add a new user to the userSockets map', () => {
      const manageSocket = ManageSocket.getInstance();
      const name = 'test';
      const socket = { emit: jest.fn() } as unknown as Socket;

      (manageSocket as any).addNewUser(name, socket);

      const userEntries = Array.from(
        (manageSocket as any).userSockets.entries(),
      ) as [string, IdentifierToSocket][];
      const [uuid, userInfo] = userEntries[0];

      expect(userInfo).toEqual({
        name: 'test',
        sockets: [socket],
      });
      expect(socket.emit).toHaveBeenCalledWith(
        'new-person',
        expect.objectContaining({
          uuid,
          name: 'test',
        }),
      );
    });
  });

  describe('getInstances()', () => {
    it('should return the instance of ManageSocket', () => {
      const manageSocket = ManageSocket.getInstance();
      const result = ManageSocket.getInstance();
      expect(result).toBe(manageSocket);
    });
  });

  describe('getInfos()', () => {
    it('should return the user info of the given uuid', () => {
      const manageSocket = ManageSocket.getInstance();
      const name = 'test';
      const socket = { emit: jest.fn() } as unknown as Socket;

      (manageSocket as any).addNewUser(name, socket);

      const userInfos = (manageSocket as any).getInfos('uuid');
      expect(userInfos).toEqual(undefined);
    });
  });

  describe('add()', () => {
    it('should add map and emit with correct data', () => {
      const manageSocket = ManageSocket.getInstance();
      const name = 'test';
      const socket = { emit: jest.fn() } as unknown as Socket;

      manageSocket.add(socket, name, undefined);

      const userEntries = Array.from(
        (manageSocket as any).userSockets.entries(),
      ) as [string, IdentifierToSocket][];
      const [uuid, userInfo] = userEntries[0];

      expect(userInfo).toEqual(
        expect.objectContaining({
          name: 'test',
          sockets: expect.arrayContaining([
            expect.objectContaining({ emit: expect.any(Function) }),
          ]),
        }),
      );

      expect(socket.emit).toHaveBeenCalledWith(
        'new-person',
        expect.objectContaining({
          uuid: expect.any(String),
          name: 'test',
        }),
      );
    });
  });

  describe('IdentifierToSocket()', () => {
    it('should return the user info of the given uuid', () => {
      const manageSocket = ManageSocket.getInstance();
      const name = 'test';
      const socket = { emit: jest.fn() } as unknown as Socket;

      (manageSocket as any).addNewUser(name, socket);

      const userInfos = (manageSocket as any).IdentifierToSocket('uuid');
      expect(userInfos).toEqual(undefined);
    });
  });

  describe('deleteSocket()', () => {
    it('should delete the socket from the userSockets map', () => {
      const manageSocket = ManageSocket.getInstance();
      const name = 'test';
      const socket = { id: 'test', emit: jest.fn() } as unknown as Socket;
      (manageSocket as any).addNewUser(name, socket);
      const initialSize = Array.from(
        (manageSocket as any).userSockets.entries(),
      ).length;
      manageSocket.deleteSocket(socket);
      const userEntriesAfterDeletion = Array.from(
        (manageSocket as any).userSockets.entries(),
      ) as [string, IdentifierToSocket][];
      expect(userEntriesAfterDeletion.length).toBe(initialSize);
      const userSocketEntry = userEntriesAfterDeletion.find(
        ([uuid, userInfo]) => userInfo.sockets.some((s) => s.id === socket.id),
      );
      expect(userSocketEntry).toBeUndefined();
    });
  });
});
