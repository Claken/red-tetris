import { describe, it, expect } from 'vitest';

export const cellColorMainGrid = (cell: number) => {
    if (cell === 1 || cell === 2) {
        return 'bg-red-500';
    } else if (cell === 102) {
        return 'bg-red-700';
    }
    return 'bg-red-900';
}

export const cellColorOppGrid = (cell: number) => {
    if (cell === 1 || cell === 2) {
        return 'bg-blue-500';
    } else if (cell === 102) {
        return 'bg-blue-700';
    }
    return 'bg-blue-900';
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
