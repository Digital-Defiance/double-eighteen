import {
  buildHighValueLayout,
  buildTwelveBodyRotated,
  HIGH_VALUE_LAYOUTS,
} from './highValue';
import { getPipLayout, PIP_LAYOUTS } from '../pipLayouts';
import {
  centeredTop3Left,
  fourRowGapTop,
  resolvePipPosition,
} from '../pipGrid';

describe('highValue pip layouts', () => {
  it.each([13, 14, 15, 16, 17, 18])('value %i has %i pips', (value) => {
    expect(getPipLayout(value)).toHaveLength(value);
  });

  it('rotated double-12 body is 3 rows of 4 columns', () => {
    const body = buildTwelveBodyRotated();
    expect(body).toHaveLength(12);
    expect(body.every((cell) => cell.gridSize === '3x4')).toBe(true);
    for (let row = 0; row < 3; row++) {
      expect(body.filter((cell) => cell.row === row)).toHaveLength(4);
    }
  });

  it('value 13 adds one centered pip over the 3×4 body', () => {
    const layout = buildHighValueLayout(13);
    const topRow = layout.filter((cell) => cell.row === 0);
    const body = layout.filter((cell) => cell.row >= 1);

    expect(topRow).toHaveLength(1);
    expect(topRow[0].col).toBe(1);
    expect(topRow[0].left).toBe(centeredTop3Left('4x4')[1]);
    expect(body).toHaveLength(12);
    expect(body.every((cell) => cell.gridSize === '4x4' && cell.col <= 3)).toBe(
      true
    );
    for (let row = 1; row <= 3; row++) {
      expect(body.filter((cell) => cell.row === row)).toHaveLength(4);
    }
  });

  it('value 14 adds outer top pips in the centered 3-column row', () => {
    const layout = buildHighValueLayout(14);
    const topRow = layout.filter((cell) => cell.row === 0);
    expect(topRow.map((cell) => cell.col).sort()).toEqual([0, 2]);
    expect(topRow.map((cell) => cell.left)).toEqual([
      centeredTop3Left('4x4')[0],
      centeredTop3Left('4x4')[2],
    ]);
  });

  it('value 15 adds a full centered top row of 3 over the 3×4 body', () => {
    const layout = buildHighValueLayout(15);
    const topRow = layout.filter((cell) => cell.row === 0);
    expect(topRow).toHaveLength(3);
    expect(topRow.every((cell) => cell.gridSize === '4x4')).toBe(true);
    expect(layout.filter((cell) => cell.row >= 1)).toHaveLength(12);
  });

  it('value 16 fills a solid 4×4 grid', () => {
    const layout = buildHighValueLayout(16);
    expect(layout).toHaveLength(16);
    expect(layout.every((cell) => cell.gridSize === '4x4s')).toBe(true);
    for (let row = 0; row < 4; row++) {
      expect(layout.filter((cell) => cell.row === row)).toHaveLength(4);
    }
  });

  it('value 17 uses 2×4 edge blocks and one centered pip', () => {
    const layout = buildHighValueLayout(17);
    expect(layout.every((cell) => cell.gridSize === '5x4')).toBe(true);

    const edges = layout.filter((cell) => cell.col !== 2);
    const center = layout.filter((cell) => cell.col === 2);

    expect(edges).toHaveLength(16);
    for (const col of [0, 1, 3, 4]) {
      expect(edges.filter((cell) => cell.col === col)).toHaveLength(4);
    }

    expect(center).toHaveLength(1);
    expect(center[0].top).toBe('50%');
    expect(center[0].left).toBe('50%');
  });

  it('value 18 uses 2×4 edge blocks and two center pips', () => {
    const layout = buildHighValueLayout(18);
    expect(layout).toHaveLength(18);
    expect(layout.every((cell) => cell.gridSize === '5x4')).toBe(true);

    const edges = layout.filter((cell) => cell.col !== 2);
    const center = layout.filter((cell) => cell.col === 2);

    expect(edges).toHaveLength(16);
    expect(center).toHaveLength(2);
    expect(center.map((cell) => cell.top).sort()).toEqual([
      fourRowGapTop(0),
      fourRowGapTop(2),
    ]);
    expect(center.every((cell) => cell.left === '50%')).toBe(true);
  });

  it('precomputed HIGH_VALUE_LAYOUTS match the generator', () => {
    for (const value of [13, 14, 15, 16, 17, 18]) {
      expect(HIGH_VALUE_LAYOUTS[value]).toEqual(buildHighValueLayout(value));
    }
  });

  it.each([13, 14, 15, 16, 17, 18])(
    'value %i resolves pip positions',
    (value) => {
      for (const cell of getPipLayout(value)) {
        const position = resolvePipPosition(cell);
        expect(position.top).toMatch(/%$/);
        expect(position.left).toMatch(/%$/);
      }
    }
  );

  it.each([13, 14, 15, 16, 17, 18])(
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
});

describe('PIP_LAYOUTS merged table', () => {
  it('defines layouts for values 0 through 18', () => {
    for (let value = 0; value <= 18; value++) {
      expect(PIP_LAYOUTS[value]).toBeDefined();
    }
  });
});
