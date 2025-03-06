import { getPipLayout, PIP_LAYOUTS } from './pipLayouts';
import { resolvePipPosition } from './pipGrid';

describe('pipLayouts', () => {
  it('defines layouts for values 0 through 12', () => {
    for (let value = 0; value <= 12; value++) {
      expect(PIP_LAYOUTS[value]).toBeDefined();
    }
  });

  it.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])(
    'value %i has %i pips',
    (value) => {
      expect(getPipLayout(value)).toHaveLength(value);
    }
  );

  it.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])(
    'value %i has unique grid positions',
    (value) => {
      const layout = getPipLayout(value);
      const keys = layout.map(
        (cell) =>
          `${cell.gridSize}:${cell.row}:${cell.col}:${cell.top ?? ''}:${cell.left ?? ''}`
      );
      expect(new Set(keys).size).toBe(layout.length);
    }
  );

  it('value 10 uses a hollow box (4-2-4)', () => {
    const layout = getPipLayout(10);
    const topRow = layout.filter((cell) => cell.row === 0);
    const middleRow = layout.filter((cell) => cell.row === 1);
    const bottomRow = layout.filter((cell) => cell.row === 2);

    expect(topRow).toHaveLength(4);
    expect(middleRow).toHaveLength(2);
    expect(middleRow.map((cell) => cell.col).sort()).toEqual([0, 3]);
    expect(bottomRow).toHaveLength(4);
  });

  it('value 11 uses a framed rectangle with centered middle pip', () => {
    const layout = getPipLayout(11);
    const leftCol = layout.filter((cell) => cell.col === 0);
    const middleCol = layout.filter((cell) => cell.col === 1);
    const rightCol = layout.filter((cell) => cell.col === 2);

    expect(leftCol).toHaveLength(4);
    expect(middleCol).toHaveLength(3);
    expect(rightCol).toHaveLength(4);
    expect(middleCol.some((cell) => cell.top === '50%')).toBe(true);
  });

  it('value 8 fills a 3x3 square with center missing', () => {
    const layout = getPipLayout(8);
    expect(layout.every((cell) => cell.gridSize === '3x3')).toBe(true);
    expect(layout.some((cell) => cell.row === 1 && cell.col === 1)).toBe(false);
  });

  it.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])(
    'value %i resolves pip positions',
    (value) => {
      for (const cell of getPipLayout(value)) {
        const position = resolvePipPosition(cell);
        expect(position.top).toMatch(/%$/);
        expect(position.left).toMatch(/%$/);
        expect(position.width).toBeTruthy();
        expect(position.height).toBeTruthy();
      }
    }
  );
});
