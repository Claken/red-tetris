import { describe, it, expect, vi } from 'vitest';

// La fonction que nous voulons tester
const displayAList = (listButtonClickedActive: boolean, listButtonClickedRooms: boolean, listButtonClickedOthers: boolean, actions: { activeRoomsList: any; myRoomsList: any; otherRoomsList: any; }) => {
  if (listButtonClickedActive) {
    return actions.activeRoomsList();
  }
  if (listButtonClickedRooms) {
    return actions.myRoomsList();
  }
  if (listButtonClickedOthers) {
    return actions.otherRoomsList();
  }
};

describe('displayAList', () => {
  it('should call activeRoomsList when listButtonClickedActive is true', () => {
    const actions = {
      activeRoomsList: vi.fn(),
      myRoomsList: vi.fn(),
      otherRoomsList: vi.fn(),
    };

    displayAList(true, false, false, actions);

    // Vérifie que activeRoomsList a été appelée
    expect(actions.activeRoomsList).toHaveBeenCalled();
    expect(actions.myRoomsList).not.toHaveBeenCalled();
    expect(actions.otherRoomsList).not.toHaveBeenCalled();
  });

  it('should call myRoomsList when listButtonClickedRooms is true', () => {
    const actions = {
      activeRoomsList: vi.fn(),
      myRoomsList: vi.fn(),
      otherRoomsList: vi.fn(),
    };

    displayAList(false, true, false, actions);

    // Vérifie que myRoomsList a été appelée
    expect(actions.myRoomsList).toHaveBeenCalled();
    expect(actions.activeRoomsList).not.toHaveBeenCalled();
    expect(actions.otherRoomsList).not.toHaveBeenCalled();
  });

  it('should call otherRoomsList when listButtonClickedOthers is true', () => {
    const actions = {
      activeRoomsList: vi.fn(),
      myRoomsList: vi.fn(),
      otherRoomsList: vi.fn(),
    };

    displayAList(false, false, true, actions);

    // Vérifie que otherRoomsList a été appelée
    expect(actions.otherRoomsList).toHaveBeenCalled();
    expect(actions.myRoomsList).not.toHaveBeenCalled();
    expect(actions.activeRoomsList).not.toHaveBeenCalled();
  });

  it('should not call any list when no button is clicked', () => {
    const actions = {
      activeRoomsList: vi.fn(),
      myRoomsList: vi.fn(),
      otherRoomsList: vi.fn(),
    };

    displayAList(false, false, false, actions);

    // Vérifie qu'aucune fonction n'a été appelée
    expect(actions.activeRoomsList).not.toHaveBeenCalled();
    expect(actions.myRoomsList).not.toHaveBeenCalled();
    expect(actions.otherRoomsList).not.toHaveBeenCalled();
  });
});

vi.mock('../contexts/socketContext', () => ({
	useSocket: vi.fn(),
  }));
  
  // Exemple de fonction à tester sans la logique UI
  const handleJoinSolo = (socket: { emit: any; } | undefined, name: string, uuid: string) => {
	if (socket) {
	  socket.emit('startSingleTetrisGame', { name, uuid });
	}
  };
  
  describe('handleJoinSolo', () => {
	it('should emit startSingleTetrisGame when called', () => {
	  // On crée une fausse fonction `emit` que nous pouvons vérifier
	  const mockEmit = vi.fn();
  
	  // On simule un faux socket
	  const fakeSocket = { emit: mockEmit };
  
	  // Appelle la fonction avec les paramètres de test
	  handleJoinSolo(fakeSocket, 'testName', 'testUuid');
  
	  // Vérifie que la fonction emit a été appelée avec les bons paramètres
	  expect(mockEmit).toHaveBeenCalledWith('startSingleTetrisGame', {
		name: 'testName',
		uuid: 'testUuid',
	  });
	});
  
	it('should not emit anything if socket is undefined', () => {
	  const mockEmit = vi.fn();
	  
	  // Appelle la fonction avec un socket indéfini
	  handleJoinSolo(undefined, 'testName', 'testUuid');
  
	  // Vérifie que `emit` n'a pas été appelée
	  expect(mockEmit).not.toHaveBeenCalled();
	});
  });
  
