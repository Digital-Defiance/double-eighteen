import { centeredTop3Left, fourRowGapTop, resolvePipPosition } from './pipGrid';

describe('pipGrid: resolvePipPosition', () => {
  it('maps 3x3 row/col onto percentage coordinates and an 18% size', () => {
    expect(resolvePipPosition({ row: 0, col: 0, gridSize: '3x3' })).toEqual({
      top: '20%',
      left: '20%',
      width: '18%',
      height: '18%',
    });
    expect(resolvePipPosition({ row: 2, col: 2, gridSize: '3x3' })).toEqual({
      top: '80%',
      left: '80%',
      width: '18%',
      height: '18%',
    });
  });

  it('uses the taller 4x3 grid spacing for values 10–12', () => {
    expect(resolvePipPosition({ row: 3, col: 1, gridSize: '4x3' })).toEqual({
      top: '85%',
      left: '50%',
      width: '14%',
      height: '14%',
    });
  });

  it('uses the 4x4 grid for values 13–15 (centered top + 3×4 body)', () => {
    expect(resolvePipPosition({ row: 2, col: 3, gridSize: '4x4' })).toEqual({
      top: '62%',
      left: '80%',
      width: '12%',
      height: '12%',
    });
  });

  it('places centered top-row pips at midpoints over four body columns', () => {
    expect(centeredTop3Left('4x4')).toEqual(['30%', '50%', '70%']);
  });

  it('uses the 4x4s grid for value 16 (even 4×4 spacing)', () => {
    expect(resolvePipPosition({ row: 3, col: 3, gridSize: '4x4s' })).toEqual({
      top: '86%',
      left: '80%',
      width: '11%',
      height: '11%',
    });
  });

  it('uses the 5x4 grid for values 17–18 (2×4 edge blocks)', () => {
    expect(resolvePipPosition({ row: 0, col: 0, gridSize: '5x4' })).toEqual({
      top: '14%',
      left: '14%',
      width: '9%',
      height: '9%',
    });
    expect(resolvePipPosition({ row: 3, col: 4, gridSize: '5x4' })).toEqual({
      top: '86%',
      left: '86%',
      width: '9%',
      height: '9%',
    });
  });

  it('floats center pips in the gaps between 4-row bands', () => {
    expect(fourRowGapTop(0)).toBe('26%');
    expect(fourRowGapTop(1)).toBe('50%');
    expect(fourRowGapTop(2)).toBe('74%');
  });

  it('honors explicit top/left overrides over the grid defaults', () => {
    const position = resolvePipPosition({
      row: 2,
      col: 1,
      gridSize: '4x3',
      top: '50%',
      left: '33%',
    });
    expect(position.top).toBe('50%');
    expect(position.left).toBe('33%');
  });
});
