export type PipGridSize = '3x3' | '3x4' | '4x3' | '4x4' | '4x4s' | '5x4';

export interface PipLayoutCell {
  row: number;
  col: number;
  gridSize: PipGridSize;
  top?: string;
  left?: string;
}

/** Four-column positions aligned with the 3×3 / 4×3 edge inset (20–80%). */
const COLS_4 = [20, 40, 60, 80] as const;

/** Three-column positions (evenly spaced, same inset as 3×3). */
const COLS_3 = [20, 50, 80] as const;

function evenlySpaced(count: number, start: number, end: number): number[] {
  if (count <= 1) return [start];
  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, i) =>
    Math.round((start + i * step) * 10) / 10
  );
}

/** Four evenly spaced row bands for solid / dense layouts (14–86%). */
const ROWS_4_EVEN = evenlySpaced(4, 14, 86);

const GRID_POSITIONS: Record<
  PipGridSize,
  { rows: number[]; cols: number[]; size: string }
> = {
  '3x3': { rows: [20, 50, 80], cols: [...COLS_3], size: '18%' },
  /** 3 rows × 4 cols — rotated double-12 body (values 13–15). */
  '3x4': { rows: [38, 62, 85], cols: [...COLS_4], size: '12%' },
  '4x3': { rows: [15, 38, 62, 85], cols: [...COLS_3], size: '14%' },
  /** 4 rows: centered 3-col top + 3×4 body (values 13–15). */
  '4x4': { rows: [14, 38, 62, 85], cols: [...COLS_4], size: '12%' },
  /** Solid 4×4 grid (value 16) — even row and column spacing. */
  '4x4s': { rows: ROWS_4_EVEN, cols: [...COLS_4], size: '11%' },
  /**
   * 5 cols × 4 rows (values 17–18): 2×4 double columns at each edge,
   * center column for 1–2 vertically aligned pips.
   */
  '5x4': {
    rows: ROWS_4_EVEN,
    cols: evenlySpaced(5, 14, 86),
    size: '9%',
  },
};

function midpoint(a: number, b: number): string {
  return `${(a + b) / 2}%`;
}

/** Midpoints between adjacent 4-col positions — top row sits equidistant over the body. */
export function centeredTop3Left(
  gridSize: '4x4'
): readonly [string, string, string] {
  const cols = GRID_POSITIONS[gridSize].cols;
  return [
    `${(cols[0] + cols[1]) / 2}%`,
    `${(cols[1] + cols[2]) / 2}%`,
    `${(cols[2] + cols[3]) / 2}%`,
  ] as const;
}

/** @deprecated Use centeredTop3Left('4x4'). */
export const CENTERED_TOP_3_LEFT = centeredTop3Left('4x4');

/**
 * Vertical center of a gap between two consecutive 4-row bands.
 * @param gapIndex 0 = between rows 0–1, 1 = between rows 1–2, 2 = between rows 2–3
 */
export function fourRowGapTop(gapIndex: number): string {
  const rows = GRID_POSITIONS['5x4'].rows;
  return midpoint(rows[gapIndex], rows[gapIndex + 1]);
}

/** @deprecated Use fourRowGapTop. */
export const denseColumnGapTop = fourRowGapTop;

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
