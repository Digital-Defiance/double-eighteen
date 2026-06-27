import { TrainBend, TrainBranch } from '@/game/TrainData';
import {
  TrainLayoutEntry,
  TrainLayoutStyle,
  computeTrainTree,
  flattenSegments,
  layoutSelfIntersects,
  layoutsCollide,
  outwardPerpSign,
  trainPerpendicular,
} from './trainLayout';

export type TurnSide = 'left' | 'right';

/** Default pivot magnitude. The interactive UI only produces square corners. */
export const TURN_DEGREES = 90;

/**
 * Signed turn (degrees) for a side. Headings use the screen convention
 * (0° = +x, +90° = +y / downward), so a `+90` turn rotates +x toward +y, which
 * reads as a clockwise/"right" turn on screen.
 */
export function sideToTurn(side: TurnSide, degrees = TURN_DEGREES): number {
  return side === 'right' ? degrees : -degrees;
}

export function oppositeSide(side: TurnSide): TurnSide {
  return side === 'right' ? 'left' : 'right';
}

/**
 * Default turn side in offset mode: fold toward the empty side — the one
 * opposite the lane the zigzag biases into (`outwardSign`). A `+90` turn heads
 * toward the heading's `+perp`; outwardSign is measured on that same perp axis,
 * so the empty side is `-outwardSign`, i.e. side = outwardSign >= 0 ? 'left' : 'right'.
 */
export function offsetDefaultSide(angle: number, outwardSign?: number): TurnSide {
  const bias = outwardSign ?? outwardPerpSign(angle);
  return bias >= 0 ? 'left' : 'right';
}

export interface TableBounds {
  width: number;
  height: number;
}

/**
 * Default turn side in linear mode: fold toward whichever perpendicular side has
 * more open table from the bend point. Distance is measured from `point` along
 * each perpendicular until it exits the table rectangle; the roomier side wins.
 * Ties (e.g. dead-center) fall back to 'right'.
 */
export function linearDefaultSide(
  point: { x: number; y: number },
  angle: number,
  bounds: TableBounds
): TurnSide {
  const { perpX, perpY } = trainPerpendicular(angle);
  const distanceToExit = (sx: number, sy: number): number => {
    // Largest t >= 0 with point + t*(sx,sy) still inside [0,w] x [0,h].
    let t = Infinity;
    if (sx > 0) t = Math.min(t, (bounds.width - point.x) / sx);
    else if (sx < 0) t = Math.min(t, (0 - point.x) / sx);
    if (sy > 0) t = Math.min(t, (bounds.height - point.y) / sy);
    else if (sy < 0) t = Math.min(t, (0 - point.y) / sy);
    return Number.isFinite(t) ? Math.max(0, t) : Infinity;
  };

  // +90 turn heads toward +perp ('right'); -90 toward -perp ('left').
  const rightRoom = distanceToExit(perpX, perpY);
  const leftRoom = distanceToExit(-perpX, -perpY);
  return rightRoom >= leftRoom ? 'right' : 'left';
}

export interface BuildTrainTilesInput {
  startX: number;
  startY: number;
  angle: number;
  layoutStyle: TrainLayoutStyle;
}

/** Flattens a branch (with feet and bends) to its world-space tiles. */
export function buildBranchTiles(
  branch: TrainBranch,
  input: BuildTrainTilesInput
): TrainLayoutEntry[] {
  return flattenSegments(
    computeTrainTree({
      startX: input.startX,
      startY: input.startY,
      angle: input.angle,
      branch,
      layoutStyle: input.layoutStyle,
    })
  );
}

/** Replaces (or removes) the bend at `index`, returning a new bends array. */
export function withBendAt(
  bends: readonly TrainBend[] | undefined,
  index: number,
  turn: number | null
): TrainBend[] {
  const rest = (bends ?? []).filter((bend) => bend.index !== index);
  if (turn === null) return rest;
  return [...rest, { index, turn }].sort((a, b) => a.index - b.index);
}

export interface ResolveBendResult {
  /** The legal turn to apply, or null when no side is collision-free. */
  turn: number | null;
  /** Why null: 'blocked' = both sides collide; never set on success. */
  reason?: 'blocked';
}

export interface ResolveBendInput {
  branch: TrainBranch;
  index: number;
  build: BuildTrainTilesInput;
  /** Tiles belonging to every OTHER path; a bend may not intersect these. */
  obstacles: readonly TrainLayoutEntry[];
  /** Preferred side to try first (from the mode's heuristic). */
  preferredSide: TurnSide;
  /** Turn magnitude in degrees (default 90). */
  degrees?: number;
}

/**
 * Picks a collision-free turn for a new bend at `index`. Tries the preferred
 * side first, then the opposite; a candidate is rejected if the resulting path
 * crosses itself or any obstacle path. Returns `{ turn: null, reason: 'blocked' }`
 * when neither side is legal, so the caller can refuse the bend.
 */
export function resolveBend({
  branch,
  index,
  build,
  obstacles,
  preferredSide,
  degrees = TURN_DEGREES,
}: ResolveBendInput): ResolveBendResult {
  const candidates: TurnSide[] = [preferredSide, oppositeSide(preferredSide)];

  for (const side of candidates) {
    const turn = sideToTurn(side, degrees);
    const candidateBranch: TrainBranch = {
      ...branch,
      bends: withBendAt(branch.bends, index, turn),
    };
    const tiles = buildBranchTiles(candidateBranch, build);
    if (layoutSelfIntersects(tiles)) continue;
    if (layoutsCollide(tiles, obstacles)) continue;
    return { turn };
  }

  return { turn: null, reason: 'blocked' };
}

/**
 * Cycles a tile's bend on repeated clicks: none → preferred legal side →
 * opposite legal side → none. Skips sides that collide. Returns the next bends
 * array, or the unchanged input when no legal bend exists.
 */
export function cycleBendAt(
  branch: TrainBranch,
  index: number,
  build: BuildTrainTilesInput,
  obstacles: readonly TrainLayoutEntry[],
  preferredSide: TurnSide,
  degrees = TURN_DEGREES
): { bends: TrainBend[]; changed: boolean; blocked: boolean } {
  const current = (branch.bends ?? []).find((bend) => bend.index === index);
  const preferredTurn = sideToTurn(preferredSide, degrees);
  const oppositeTurn = sideToTurn(oppositeSide(preferredSide), degrees);

  const isLegal = (turn: number): boolean => {
    const candidate: TrainBranch = {
      ...branch,
      bends: withBendAt(branch.bends, index, turn),
    };
    const tiles = buildBranchTiles(candidate, build);
    return !layoutSelfIntersects(tiles) && !layoutsCollide(tiles, obstacles);
  };

  // Cycle order by current state. `null` means "straighten" (remove the bend),
  // which is always legal — but it's only a cycle target when a bend already
  // exists. Starting from straight with both sides blocked reports `blocked`
  // rather than performing a no-op removal.
  let order: (number | null)[];
  if (!current) {
    order = [preferredTurn, oppositeTurn];
  } else if (current.turn === preferredTurn) {
    order = [oppositeTurn, null];
  } else if (current.turn === oppositeTurn) {
    order = [null];
  } else {
    order = [preferredTurn, oppositeTurn, null];
  }

  for (const turn of order) {
    if (turn === null) {
      return { bends: withBendAt(branch.bends, index, null), changed: true, blocked: false };
    }
    if (isLegal(turn)) {
      return { bends: withBendAt(branch.bends, index, turn), changed: true, blocked: false };
    }
  }

  return { bends: branch.bends ?? [], changed: false, blocked: true };
}
