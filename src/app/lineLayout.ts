import type { DominoValue } from '../game/DominoValue';
import {
  DOMINO_HEIGHT,
  DOMINO_WIDTH,
  halfExtentAlongTrain,
} from './trainLayout';

export type LineEndId = 'left' | 'right' | 'top' | 'bottom';

/** Degrees: 0 = +x (right), 90 = +y (down). */
export const LINE_END_ANGLES: Readonly<Record<LineEndId, number>> = {
  right: 0,
  bottom: 90,
  left: 180,
  top: 270,
};

export interface LineArmData {
  readonly end: LineEndId;
  readonly dominoes: readonly DominoValue[];
}

export interface ComputeLineLayoutInput {
  readonly centerX: number;
  readonly centerY: number;
  /** Spinner or seed tile at the center (null = empty board). */
  readonly center: DominoValue | null;
  readonly arms: readonly LineArmData[];
  /**
   * Extra gap between the center tile's outer edge and the first arm tile.
   * Default 0 so arm tiles abut the spinner/seed.
   */
  readonly startGap?: number;
}

export interface LineArmPlacement {
  readonly end: LineEndId;
  /** Train origin — same as the center tile's center (DominoTrain leadGap reaches out). */
  readonly startX: number;
  readonly startY: number;
  readonly angle: number;
  /**
   * Distance from (startX, startY) to the center of the first arm tile so that
   * tile's near edge touches the center tile (plus optional startGap).
   */
  readonly leadGap: number;
  readonly dominoes: readonly DominoValue[];
  /** Hit-target / play-button anchor for this end. */
  readonly highlightX: number;
  readonly highlightY: number;
}

export interface LineLayoutResult {
  readonly centerX: number;
  readonly centerY: number;
  readonly center: DominoValue | null;
  readonly arms: readonly LineArmPlacement[];
  readonly width: number;
  readonly height: number;
}

function isDoubleValue(tile: DominoValue): boolean {
  return tile.value1 === tile.value2;
}

/**
 * Half-extent of the center tile along a cardinal arm.
 * Spinner (double) is rendered upright; seed (non-double) is rendered on its side.
 */
export function centerHalfExtentAlongEnd(
  end: LineEndId,
  center: DominoValue | null
): number {
  if (!center) {
    return DOMINO_WIDTH / 2;
  }
  if (isDoubleValue(center)) {
    return end === 'left' || end === 'right'
      ? DOMINO_WIDTH / 2
      : DOMINO_HEIGHT / 2;
  }
  // Horizontal seed: long axis left–right.
  return end === 'left' || end === 'right'
    ? DOMINO_HEIGHT / 2
    : DOMINO_WIDTH / 2;
}

function firstArmTileHalfExtent(dominoes: readonly DominoValue[]): number {
  if (dominoes.length === 0) {
    // Empty play slot: assume a regular tile will be placed.
    return halfExtentAlongTrain(false);
  }
  const first = dominoes[0]!;
  return halfExtentAlongTrain(isDoubleValue(first));
}

/**
 * Place a classic spinner (or seed) at center with four cardinal arm starts.
 * Arm geometry is consumed by DominoTrain (same as Mexican Train spokes).
 *
 * Train origins sit at the center; `leadGap` is sized so the first arm tile
 * abuts the center tile (zero default gap).
 */
export function computeLineLayout(
  input: ComputeLineLayoutInput
): LineLayoutResult {
  const gap = input.startGap ?? 0;
  const arms: LineArmPlacement[] = input.arms.map((arm) => {
    const angle = LINE_END_ANGLES[arm.end];
    const radians = (angle * Math.PI) / 180;
    const leadGap =
      centerHalfExtentAlongEnd(arm.end, input.center) +
      gap +
      firstArmTileHalfExtent(arm.dominoes);
    const dirX = Math.cos(radians);
    const dirY = Math.sin(radians);
    // Highlight at the first-tile center for empty arms; otherwise past the
    // open end (approximate: center + leadGap + remaining run length).
    const runExtra =
      arm.dominoes.length <= 1
        ? 0
        : (arm.dominoes.length - 1) * (DOMINO_HEIGHT * 0.75);
    const highlightDist = leadGap + runExtra;
    return {
      end: arm.end,
      startX: input.centerX,
      startY: input.centerY,
      angle,
      leadGap,
      dominoes: arm.dominoes,
      highlightX: input.centerX + highlightDist * dirX,
      highlightY: input.centerY + highlightDist * dirY,
    };
  });

  const maxLead = Math.max(0, ...arms.map((a) => a.leadGap));
  const maxArm = Math.max(0, ...arms.map((a) => a.dominoes.length));
  const extent =
    maxLead + maxArm * (DOMINO_HEIGHT + 4) + DOMINO_HEIGHT;
  const size = Math.max(extent * 2, 320);

  return {
    centerX: input.centerX,
    centerY: input.centerY,
    center: input.center,
    arms,
    width: size,
    height: size,
  };
}

export { DOMINO_WIDTH, DOMINO_HEIGHT };
