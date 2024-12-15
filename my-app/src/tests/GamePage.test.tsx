import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
// import { SocketProvider } from '../contexts/socketContext';
// import GamePage from '../components/GamePage';

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
        <div key={rowIndex} className="flex">
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

const displaySpectrums = (specList: any, left: boolean) => {

    const idx = 6;
    const rightOrLeft = (index: any): boolean => {
        console.log("index == " + index);
        if (left) {
            return index < idx;
        }
        return index >= idx;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:space-x-4">
            {specList.map((spectrum: any, index: number) => (
                <div key={index} className="w-[70px]">
                    {rightOrLeft(index) && <div className="">
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

describe('displayTetromino', () => {
    it('should display the tetromino correctly', () => {
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

    });
});

describe('displaySpectrums', () => {
    it('devrait correctement afficher les spectres du côté gauche et du cote droit', () => {

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
    })
});
