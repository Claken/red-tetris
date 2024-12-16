import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
// import { SocketProvider } from '../contexts/socketContext';
// import GamePage from '../components/GamePage';

const setGridWithRightSize = (grid: number[][]) => {
    const newGrid = grid.slice(4, 24);
    return newGrid;
}

const cellColorMainGrid = (cell: number) => {
    if (cell === 1 || cell === 2) {
        return 'bg-red-500';
    } else if (cell === 102) {
        return 'bg-red-700';
    }
    return 'bg-red-900';
}

const cellColorOppGrid = (cell: number) => {
    if (cell === 1 || cell === 2) {
        return 'bg-blue-500';
    } else if (cell === 102) {
        return 'bg-blue-700';
    }
    return 'bg-blue-900';
}

const getTetroColor = (type: string) => {
    switch (type) {
        case ('I'):
            return 'bg-[#00ffff]'
        case ('J'):
            return 'bg-[#0077ff]'
        case ('L'):
            return 'bg-[#ff7f00]'
        case ('O'):
            return 'bg-[#ffff00]'
        case ('S'):
            return 'bg-[#00ff00]'
        case ('T'):
            return 'bg-[#800080]'
        case ('Z'):
            return 'bg-[#ff0000]'
    }
}

const displayTetromino = (tetromino: any) => {
    const tetroColor = getTetroColor(tetromino.type);
    return tetromino.shape.map((row: number[], rowIndex: number) => (
        <div data-testid={rowIndex} key={rowIndex} className="flex">
            {row.map((cell: number, colIndex: number) => (
                <div
                    key={colIndex}
                    className={`w-4 h-4 border border-gray-900 ${cell !== 0 ? tetroColor : 'bg-transparent'}`}
                >
                </div>
            ))}
        </div>
    ));
};

const rightOrLeft = (index: any, left: boolean): boolean => {
    const idx = 6;
    
    if (left) {
        return index < idx;
    }
    return index >= idx;
}

const displaySpectrums = (specList: any, left: boolean) => {

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:space-x-4">
            {specList.map((spectrum: any, index: number) => (
                <div key={index} className="w-[70px]">
                    {rightOrLeft(index, left) && <div className="">
                        <h3 className="text-lg text-white text-center truncate font-semibold mb-2">{spectrum.name}</h3>
                        <div
                            className="grid grid-cols-10 gap-0"
                        >
                            {spectrum.spectrum.flat().map((value: number, idx: number) => (
                                <div
                                    key={idx}
                                    className={`w-2 h-2 border border-gray-700 ${value > 0 ? (value === 1 ? 'bg-cyan-500' : 'bg-red-800') : 'bg-transparent'
                                        }`}
                                ></div>
                            ))}
                        </div>
                    </div>}
                </div>
            ))}
        </div>
    );
}

describe('cellColorMainGrid', () => {
    it('should return bg-red-500 when cell is 1 or 2', () => {
        expect(cellColorMainGrid(1)).toBe('bg-red-500');
        expect(cellColorMainGrid(2)).toBe('bg-red-500');
    });

    it('should return bg-red-700 when cell is 102', () => {
        expect(cellColorMainGrid(102)).toBe('bg-red-700');
    });

    it('should return bg-red-900 for any other values', () => {
        expect(cellColorMainGrid(0)).toBe('bg-red-900');
        expect(cellColorMainGrid(5)).toBe('bg-red-900');
    });
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

describe('cellColorOppGrid', () => {
    it('should return bg-blue-500 when cell is 1 or 2', () => {
        expect(cellColorOppGrid(1)).toBe('bg-blue-500');
        expect(cellColorOppGrid(2)).toBe('bg-blue-500');
    });

    it('should return bg-blue-700 when cell is 102', () => {
        expect(cellColorOppGrid(102)).toBe('bg-blue-700');
    });

    it('should return bg-blue-900 for any other values', () => {
        expect(cellColorOppGrid(0)).toBe('bg-blue-900');
        expect(cellColorOppGrid(5)).toBe('bg-blue-900');
    })
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

describe('rightOrLeft', () => {
    it('should return true if index is less than 6 and left is true', () => {
        expect(rightOrLeft(5, true)).toBe(true);
    });

    it('should return false if index is greater than or equal to 6 and left is true', () => {
        expect(rightOrLeft(6, true)).toBe(false);
        expect(rightOrLeft(7, true)).toBe(false);
    });

    it('should return true if index is greater than or equal to 6 and left is false', () => {
        expect(rightOrLeft(6, false)).toBe(true);
        expect(rightOrLeft(7, false)).toBe(true);
    });

    it('should return false if index is less than 6 and left is false', () => {
        expect(rightOrLeft(5, false)).toBe(false);
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
