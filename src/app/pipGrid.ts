export type PipGridSize = '3x3' | '3x4' | '4x3';

export interface PipLayoutCell {
  row: number;
  col: number;
  gridSize: PipGridSize;
  top?: string;
  left?: string;
}

const GRID_POSITIONS: Record<
  PipGridSize,
  { rows: number[]; cols: number[]; size: string }
> = {
  '3x3': { rows: [20, 50, 80], cols: [20, 50, 80], size: '18%' },
  '3x4': { rows: [24, 50, 76], cols: [22, 40, 60, 78], size: '12%' },
  '4x3': { rows: [15, 38, 62, 85], cols: [20, 50, 80], size: '14%' },
};

export function resolvePipPosition(cell: PipLayoutCell): {
  top: string;
  left: string;
  width: string;
  height: string;
} {
  const grid = GRID_POSITIONS[cell.gridSize];

  return {
    top: cell.top ?? `${grid.rows[cell.row]}%`,
    left: cell.left ?? `${grid.cols[cell.col]}%`,
    width: grid.size,
    height: grid.size,
  };
}
