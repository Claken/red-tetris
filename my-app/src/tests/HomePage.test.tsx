import { describe, it, expect, vi } from 'vitest';
import HomePage  from '../components/HomePage';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { SocketProvider } from '../contexts/socketContext';
import React, { createContext } from 'react';

describe('HomePage Component', () => {
  it('renders the HomePage component', () => {
    render(
      <MemoryRouter>
        <SocketProvider>
          <HomePage />
        </SocketProvider>
      </MemoryRouter>
    );
    const linkElement = screen.getByTestId('connect-page');
    expect(document.body.contains(linkElement)).toBe(true);
  });
});

// const mockSocket = {
//   emit: vi.fn(),
//   on: vi.fn(),
//   off: vi.fn(),
// };
// const mockSetSocket = vi.fn();

// // Création manuelle du SocketContext avec des valeurs mockées
// const MockSocketContext = createContext({
//   socket: mockSocket,
//   setSocket: mockSetSocket,
// });

// describe('HomePage - displayAList', () => {
//   it('devrait afficher les salles actives lorsque le bouton listButtonClickedActive est vrai', () => {
//     // Mock du socket
//     const mockSocket = {
//       emit: vi.fn(),
//       on: vi.fn(),
//       off: vi.fn(),
//       // Add other properties as needed
//     };

//     const mockSetSocket = vi.fn();

//     // Mock des états (useState)
//     vi.spyOn(React, 'useState')
//       .mockImplementationOnce(() => [true, vi.fn()]) // listButtonClickedActive = true
//       .mockImplementationOnce(() => [false, vi.fn()]) // listButtonClickedRooms = false
//       .mockImplementationOnce(() => [false, vi.fn()]); // listButtonClickedOthers = false

//     render(
//       <MockSocketContext.Provider value={{ socket: mockSocket, setSocket: mockSetSocket }}>
//         <BrowserRouter>
//           <HomePage />
//         </BrowserRouter>
//       </MockSocketContext.Provider>
//     );

//     // Attendez que l'appel socket.emit("getActiveRooms") soit déclenché
//     expect(mockSocket.emit).toHaveBeenCalledWith("getActiveRooms", { uuid: undefined });

//     // Ici, vous pouvez tester si la liste des salles est rendue comme attendu
//     expect(screen.getByText('ACTIVE ROOMLIST')).toBeDefined();
//   });
// });
  
