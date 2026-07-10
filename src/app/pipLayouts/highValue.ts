import type { PipLayoutCell } from '../pipGrid';
import { centeredTop3Left, fourRowGapTop } from '../pipGrid';
import { PIP_LAYOUTS as CLASSIC_LAYOUTS } from './classic';

/**
 * Rotated double-12 body for 13–15: portrait 4×3 turned sideways → 3 rows × 4 cols.
 * (Distinct from classic value 12, which stays portrait 4×3.)
 */
export function buildTwelveBodyRotated(): PipLayoutCell[] {
  const cells: PipLayoutCell[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      cells.push({ row, col, gridSize: '3x4' });
    }
  }
  return cells;
}

/** @deprecated Use buildTwelveBodyRotated — high-value body is 3×4, not portrait 4×3. */
export const buildTwelveBody = buildTwelveBodyRotated;

/** Top-row pip columns for remainder 1 (center), 2 (outer), or 3 (full). */
function remainderRowCols(remainder: number): number[] {
  switch (remainder) {
    case 1:
      return [1];
    case 2:
      return [0, 2];
    case 3:
      return [0, 1, 2];
    default:
      return [];
  }
}

/** Centered 3-column remainder row above the 4-wide rotated body. */
function buildCenteredTopRow(remainder: number): PipLayoutCell[] {
  const lefts = centeredTop3Left('4x4');
  return remainderRowCols(remainder).map((col) => ({
    row: 0,
    col,
    gridSize: '4x4',
    left: lefts[col],
  }));
}

/** 13–15: centered top row + 3×4 rotated double-12 body. */
function buildOnTwelveBody(extra: number): PipLayoutCell[] {
  const body = buildTwelveBodyRotated().map((cell) => ({
    ...cell,
    row: cell.row + 1,
    gridSize: '4x4' as const,
  }));
  const top = buildCenteredTopRow(extra);
  return [...top, ...body];
}

/** Value 16: solid 4×4 grid with even row/column spacing. */
function buildLayout16(): PipLayoutCell[] {
  const cells: PipLayoutCell[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      cells.push({ row, col, gridSize: '4x4s' });
    }
  }
  return cells;
}

/** Left and right 2×4 double columns (cols 0–1 and 3–4). */
function buildEdgeDoubleColumns(): PipLayoutCell[] {
  const gridSize = '5x4' as const;
  const cells: PipLayoutCell[] = [];
  for (const col of [0, 1, 3, 4] as const) {
    for (let row = 0; row < 4; row++) {
      cells.push({ row, col, gridSize });
    }
  }
  return cells;
}

/** Value 17: 2×4 at each edge + one pip centered between the outer blocks. */
function buildLayout17(): PipLayoutCell[] {
  return [
    ...buildEdgeDoubleColumns(),
    {
      row: 10,
      col: 2,
      gridSize: '5x4',
      top: '50%',
      left: '50%',
    },
  ];
}

/** Value 18: 2×4 at each edge + two pips vertically aligned in the center column. */
function buildLayout18(): PipLayoutCell[] {
  return [
    ...buildEdgeDoubleColumns(),
    {
      row: 10,
      col: 2,
      gridSize: '5x4',
      top: fourRowGapTop(0),
      left: '50%',
    },
    {
      row: 11,
      col: 2,
      gridSize: '5x4',
      top: fourRowGapTop(2),
      left: '50%',
    },
  ];
}

/**
 * Build layouts 13–18.
 * - 13–15: rotated 3×4 body + centered top row.
 * - 16: solid 4×4.
 * - 17–18: 2×4 double columns at each edge + 1–2 center pips.
 */
export function buildHighValueLayout(value: number): readonly PipLayoutCell[] {
  if (value <= 12) {
    return CLASSIC_LAYOUTS[value] ?? [];
  }

  if (value <= 15) {
    return buildOnTwelveBody(value - 12);
  }

  switch (value) {
    case 16:
      return buildLayout16();
    case 17:
      return buildLayout17();
    case 18:
      return buildLayout18();
    default:
      return [];
  }
}

/** Precomputed layouts for values 13–18. */
export const HIGH_VALUE_LAYOUTS: Record<number, readonly PipLayoutCell[]> = {
  13: buildHighValueLayout(13),
  14: buildHighValueLayout(14),
  15: buildHighValueLayout(15),
  16: buildHighValueLayout(16),
  17: buildHighValueLayout(17),
  18: buildHighValueLayout(18),
};
