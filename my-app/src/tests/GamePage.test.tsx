import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { cellColorMainGrid, getTetroColor, displayTetromino, displaySpectrums } from '../functions/forTheGame';
import React from 'react';
// import { SocketProvider } from '../contexts/socketContext';
import GamePage from '../components/GamePage';
import { MemoryRouter } from 'react-router-dom';
import { SocketProvider } from '../contexts/socketContext';

const setGridWithRightSize = (grid: number[][]) => {
    const newGrid = grid.slice(4, 24);
    return newGrid;
}

describe('GamePage Component', () => {
    it('renders the GamePage component', () => {
        render(
            <MemoryRouter>
                <SocketProvider>
                    <GamePage />
                </SocketProvider>
            </MemoryRouter>
        );
        const linkElement = screen.getByTestId('waiting-logo');
        expect(document.body.contains(linkElement)).toBe(true);

    });
});


describe('cellColorMainGrid', () => {
    it('should return the correct color for each cell', () => {
        expect(cellColorMainGrid(1)).toBe('bg-[#00ffff]');
        expect(cellColorMainGrid(2)).toBe('bg-[#0077ff]');
        expect(cellColorMainGrid(3)).toBe('bg-[#ff7f00]');
        expect(cellColorMainGrid(4)).toBe('bg-[#ffff00]');
        expect(cellColorMainGrid(5)).toBe('bg-[#00ff00]');
        expect(cellColorMainGrid(6)).toBe('bg-[#800080]');
        expect(cellColorMainGrid(7)).toBe('bg-[#ff0000]');
        expect(cellColorMainGrid(0)).toBe('bg-[#1a1b26]');
        expect(cellColorMainGrid(102)).toBe('bg-[#7d0202] opacity-75');
        expect(cellColorMainGrid(20)).toBe('bg-gray-500');
    }
    );
});

describe('getTetroColor', () => {
    it('should return the correct color for each type of tetromino', () => {
        expect(getTetroColor('I')).toBe('bg-[#00ffff]');
        expect(getTetroColor('J')).toBe('bg-[#0077ff]');
        expect(getTetroColor('L')).toBe('bg-[#ff7f00]');
        expect(getTetroColor('O')).toBe('bg-[#ffff00]');
        expect(getTetroColor('S')).toBe('bg-[#00ff00]');
        expect(getTetroColor('T')).toBe('bg-[#800080]');
        expect(getTetroColor('Z')).toBe('bg-[#ff0000]');
    });
});

describe('setGridWithRightSize', () => {
    it('should return a grid with the right size', () => {
        const grid = Array(24).fill(Array(10).fill(0));
        const newGrid = setGridWithRightSize(grid);

        expect(newGrid.length).toBe(20);
        expect(newGrid[0].length).toBe(10);
    });
});

describe('displayTetromino', () => {
    it('should display tetromino correctly', () => {
        const tetromino = {
            type: 'I',
            shape: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ]
        };

        render(
            <div>
                {displayTetromino(tetromino)}
            </div>
        );

        const row1 = screen.getByTestId('0');
        const row2 = screen.getByTestId('1');
        const row3 = screen.getByTestId('2');
        const row4 = screen.getByTestId('3');

        expect(document.body.contains(row1)).toBe(true);
        expect(document.body.contains(row2)).toBe(true);
        expect(document.body.contains(row3)).toBe(true);
        expect(document.body.contains(row4)).toBe(true);

        expect(row1.children.length).toBe(4);
        expect(row2.children.length).toBe(4);
        expect(row3.children.length).toBe(4);
        expect(row4.children.length).toBe(4);

        expect(row1.children[0].className).contains('bg-transparent');
        expect(row2.children[0].className).not.contains('bg-transparent');
        expect(row3.children[0].className).contains('bg-transparent');
        expect(row4.children[0].className).contains('bg-transparent');
    });
});

describe('displaySpectrums', () => {
    it('should display spectrums correctly', () => {

        const specList = [
            {
                name: 'Player1',
                spectrum: Array(20).fill([0, 1, 0, 1, 0, 1, 0, 1, 0, 1])
            },
            {
                name: 'Player2',
                spectrum: Array(20).fill([1, 0, 1, 0, 1, 0, 1, 0, 1, 0])
            }
        ];

        render(
            <div>
                {displaySpectrums(specList, true)}
                {displaySpectrums(specList, false)}
            </div>
        );

        const player1 = screen.getByText('Player1');
        const player2 = screen.getByText('Player2');

        expect(document.body.contains(player1)).toBe(true);
        expect(document.body.contains(player2)).toBe(true);
    });

});
