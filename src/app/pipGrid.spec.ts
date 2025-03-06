import { resolvePipPosition } from './pipGrid';

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

  it('uses the wider 3x4 grid spacing for value 10 layouts', () => {
    expect(resolvePipPosition({ row: 1, col: 3, gridSize: '3x4' })).toEqual({
      top: '50%',
      left: '78%',
      width: '12%',
      height: '12%',
    });
  });

  it('uses the taller 4x3 grid spacing for values 11 and 12', () => {
    expect(resolvePipPosition({ row: 3, col: 1, gridSize: '4x3' })).toEqual({
      top: '85%',
      left: '50%',
      width: '14%',
      height: '14%',
    });
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
