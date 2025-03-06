import { DominoValue } from '@/game/DominoValue';
import { TrainBranch } from '@/game/TrainData';
import {
  DOMINO_HEIGHT,
  DOMINO_WIDTH,
  TrainLayoutEntry,
  TrainLayoutStyle,
  TrainSegment,
  nextPerpOffset,
  outwardPerpSign,
  stepAlongTrain,
  tilesOverlap,
  trainDirection,
  trainPerpendicular,
} from '@/app/trainLayout';

export interface LayoutValidationIssue {
  code: string;
  message: string;
  index?: number;
}

export interface LayoutValidationResult {
  valid: boolean;
  issues: LayoutValidationIssue[];
}

const DEFAULT_TOLERANCE = 1;

export function projectOnTrainAxis(
  dx: number,
  dy: number,
  angle: number
): number {
  const { dirX, dirY } = trainDirection(angle);
  return dx * dirX + dy * dirY;
}

export function projectOnPerpendicularAxis(
  dx: number,
  dy: number,
  angle: number
): number {
  const { perpX, perpY } = trainPerpendicular(angle);
  return dx * perpX + dy * perpY;
}

export function validateDominoChain(dominoes: readonly DominoValue[]): LayoutValidationResult {
  const issues: LayoutValidationIssue[] = [];

  for (let i = 1; i < dominoes.length; i++) {
    if (dominoes[i].value1 !== dominoes[i - 1].value2) {
      issues.push({
        code: 'chain-break',
        message: `Domino ${i} does not connect to domino ${i - 1}`,
        index: i,
      });
    }
  }

  for (let i = 1; i < dominoes.length; i++) {
    const prevIsDouble = dominoes[i - 1].value1 === dominoes[i - 1].value2;
    const currentIsDouble = dominoes[i].value1 === dominoes[i].value2;
    if (prevIsDouble && currentIsDouble) {
      issues.push({
        code: 'consecutive-doubles',
        message: `Consecutive doubles at index ${i - 1} and ${i}`,
        index: i,
      });
    }
  }

  return { valid: issues.length === 0, issues };
}

export interface AxisPosition {
  along: number;
  perp: number;
}

/**
 * Reconstructs the expected position of every tile in train-axis space
 * (along the train and perpendicular to it), mirroring computeTrainLayout.
 * Positions are relative to the first tile, so only deltas are meaningful.
 */
export function expectedAxisLayout(
  layout: readonly TrainLayoutEntry[],
  layoutStyle: TrainLayoutStyle,
  outwardSign: number,
  dominoWidth = DOMINO_WIDTH,
  dominoHeight = DOMINO_HEIGHT
): AxisPosition[] {
  const perpStep = dominoWidth / 2;
  const isDoubleArr = layout.map((entry) => entry.isDouble);

  const positions: AxisPosition[] = [];
  let along = 0;
  let perp = 0;
  let laneSign = 0;

  for (let i = 0; i < layout.length; i++) {
    const isDouble = isDoubleArr[i];
    const prevIsDouble = i > 0 && isDoubleArr[i - 1];

    if (layoutStyle === 'linear') {
      if (i > 0) {
        along += stepAlongTrain(prevIsDouble, isDouble, dominoWidth, dominoHeight);
      }
      perp = 0;
    } else if (isDouble) {
      // Double stays in the current lane (aligned with the tile it connects to).
      if (i > 0) {
        along += stepAlongTrain(prevIsDouble, true, dominoWidth, dominoHeight);
      }
      // perp unchanged
    } else if (i === 0) {
      laneSign = outwardSign;
      perp = laneSign * perpStep;
    } else if (prevIsDouble) {
      // First tile out of a double stays in the double's lane (mirror).
      along += stepAlongTrain(true, false, dominoWidth, dominoHeight);
      // perp unchanged
    } else {
      along += dominoHeight / 2;
      laneSign = nextPerpOffset(laneSign, outwardSign);
      perp = laneSign * perpStep;
    }

    positions.push({ along, perp });
  }

  return positions;
}

export function validateConsecutiveSpacing(
  layout: readonly TrainLayoutEntry[],
  angle: number,
  layoutStyle: TrainLayoutStyle,
  tolerance = DEFAULT_TOLERANCE,
  outwardSignOverride?: number
): LayoutValidationResult {
  const issues: LayoutValidationIssue[] = [];
  const outwardSign = outwardSignOverride ?? outwardPerpSign(angle);
  const expected = expectedAxisLayout(layout, layoutStyle, outwardSign);

  for (let i = 1; i < layout.length; i++) {
    const prev = layout[i - 1];
    const current = layout[i];
    const dx = current.x - prev.x;
    const dy = current.y - prev.y;
    const along = projectOnTrainAxis(dx, dy, angle);
    const perp = projectOnPerpendicularAxis(dx, dy, angle);
    const expectedAlong = expected[i].along - expected[i - 1].along;
    const expectedPerp = expected[i].perp - expected[i - 1].perp;

    if (Math.abs(along - expectedAlong) > tolerance) {
      issues.push({
        code: 'spacing-along-train',
        message: `Along-train spacing between domino ${i - 1} and ${i} is ${along.toFixed(2)}px (expected ${expectedAlong}px)`,
        index: i,
      });
    }

    if (Math.abs(perp - expectedPerp) > tolerance) {
      issues.push({
        code: 'spacing-perpendicular',
        message: `Perpendicular spacing between domino ${i - 1} and ${i} is ${perp.toFixed(2)}px (expected ${expectedPerp}px)`,
        index: i,
      });
    }
  }

  return { valid: issues.length === 0, issues };
}

export function validateNoPairOverlap(
  layout: readonly TrainLayoutEntry[],
  angle: number,
  layoutStyle: TrainLayoutStyle,
  tolerance = DEFAULT_TOLERANCE,
  outwardSignOverride?: number
): LayoutValidationResult {
  const issues: LayoutValidationIssue[] = [];
  const outwardSign = outwardSignOverride ?? outwardPerpSign(angle);
  const expected = expectedAxisLayout(layout, layoutStyle, outwardSign);

  for (let i = 1; i < layout.length; i++) {
    const prev = layout[i - 1];
    const current = layout[i];
    const dx = current.x - prev.x;
    const dy = current.y - prev.y;
    const distance = Math.hypot(dx, dy);
    const expectedAlong = expected[i].along - expected[i - 1].along;
    const expectedPerp = expected[i].perp - expected[i - 1].perp;
    const minDistance = Math.hypot(expectedAlong, expectedPerp) * 0.9;

    if (distance + tolerance < minDistance) {
      issues.push({
        code: 'overlap',
        message: `Domino ${i - 1} and ${i} centers are ${distance.toFixed(2)}px apart (minimum ${minDistance.toFixed(2)}px)`,
        index: i,
      });
    }
  }

  return { valid: issues.length === 0, issues };
}

export function validateTrainLayout(
  layout: readonly TrainLayoutEntry[],
  dominoes: readonly DominoValue[],
  angle: number,
  layoutStyle: TrainLayoutStyle,
  tolerance = DEFAULT_TOLERANCE,
  outwardSignOverride?: number
): LayoutValidationResult {
  const issues: LayoutValidationIssue[] = [
    ...validateDominoChain(dominoes).issues,
    ...validateConsecutiveSpacing(
      layout,
      angle,
      layoutStyle,
      tolerance,
      outwardSignOverride
    ).issues,
    ...validateNoPairOverlap(
      layout,
      angle,
      layoutStyle,
      tolerance,
      outwardSignOverride
    ).issues,
  ];

  if (layout.length !== dominoes.length) {
    issues.push({
      code: 'layout-length',
      message: `Layout length ${layout.length} does not match domino count ${dominoes.length}`,
    });
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Validates the chicken-foot branch tree as data: every chain links up, every
 * foot hangs off a real double, and every toe's first tile matches the double's
 * value. Recurses into nested feet.
 */
export function validateChickenFootChain(
  branch: TrainBranch
): LayoutValidationResult {
  const issues: LayoutValidationIssue[] = [];

  const walk = (current: TrainBranch, path: string) => {
    issues.push(
      ...validateDominoChain(current.dominoes).issues.map((issue) => ({
        ...issue,
        message: `[${path}] ${issue.message}`,
      }))
    );

    if (!current.feet) {
      return;
    }

    for (const key of Object.keys(current.feet)) {
      const hostIndex = Number(key);
      const host = current.dominoes[hostIndex];
      const toes = current.feet[hostIndex] ?? [];

      if (!host) {
        issues.push({
          code: 'foot-host-missing',
          message: `[${path}] Foot references missing tile ${hostIndex}`,
        });
        continue;
      }

      if (host.value1 !== host.value2) {
        issues.push({
          code: 'foot-host-not-double',
          message: `[${path}] Foot host tile ${hostIndex} is not a double`,
        });
      }

      if (toes.length > 2) {
        issues.push({
          code: 'foot-too-many-toes',
          message: `[${path}] Double ${hostIndex} has ${toes.length} side toes (max 2; the center toe is the main line)`,
        });
      }

      toes.forEach((toe, toeIndex) => {
        const first = toe.dominoes[0];
        if (first && first.value1 !== host.value1) {
          issues.push({
            code: 'foot-connection',
            message: `[${path}] Toe ${toeIndex} on double ${hostIndex} starts with ${first.value1} but the double is ${host.value1}`,
          });
        }
        walk(toe, `${path}.${hostIndex}.${toeIndex}`);
      });
    }
  };

  walk(branch, 'main');
  return { valid: issues.length === 0, issues };
}

/**
 * Validates a laid-out chicken-foot tree. Each run's tiles must link up by value
 * and match its tile count; each toe must start the right distance out from its
 * host double (measured along the toe's axis); and — the hard physical rule — no
 * two tiles anywhere in the tree may overlap.
 *
 * The center toe is a centered linear run while the inbound spine is offset, so
 * a single run can mix layout styles; the per-tile overlap test below checks the
 * real constraint directly rather than reconstructing each style's spacing.
 */
export function validateTrainTree(
  segments: readonly TrainSegment[],
  tolerance = DEFAULT_TOLERANCE
): LayoutValidationResult {
  const issues: LayoutValidationIssue[] = [];

  segments.forEach((segment, segmentIndex) => {
    issues.push(
      ...validateDominoChain(segment.dominoes).issues.map((issue) => ({
        ...issue,
        message: `[segment ${segmentIndex} @${segment.angle}°] ${issue.message}`,
      }))
    );

    if (segment.layout.length !== segment.dominoes.length) {
      issues.push({
        code: 'layout-length',
        message: `[segment ${segmentIndex}] Layout length ${segment.layout.length} does not match domino count ${segment.dominoes.length}`,
      });
    }

    if (segment.anchor && segment.layout.length > 0) {
      const first = segment.layout[0];
      const along = projectOnTrainAxis(
        first.x - segment.anchor.x,
        first.y - segment.anchor.y,
        segment.angle
      );
      const expected = DOMINO_HEIGHT / 2;
      if (Math.abs(along - expected) > tolerance) {
        issues.push({
          code: 'foot-anchor',
          message: `[segment ${segmentIndex}] First toe tile sits ${along.toFixed(2)}px from the double along the toe (expected ${expected}px)`,
          index: 0,
        });
      }
    }
  });

  // Physical rule: dominoes are solid, so no two tiles may overlap anywhere.
  const tiles = segments.flatMap((segment) => segment.layout);
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tilesOverlap(tiles[i], tiles[j])) {
        issues.push({
          code: 'tile-overlap',
          message: `Tiles ${i} and ${j} overlap`,
          index: j,
        });
      }
    }
  }

  return { valid: issues.length === 0, issues };
}

export function dominoCorners(
  entry: TrainLayoutEntry,
  dominoWidth = DOMINO_WIDTH,
  dominoHeight = DOMINO_HEIGHT
): { x: number; y: number }[] {
  const rotation = (entry.rotation * Math.PI) / 180;
  const halfW = dominoWidth / 2;
  const halfH = dominoHeight / 2;
  const localCorners = [
    { x: -halfW, y: -halfH },
    { x: halfW, y: -halfH },
    { x: halfW, y: halfH },
    { x: -halfW, y: halfH },
  ];

  return localCorners.map(({ x, y }) => {
    const rotatedX = x * Math.cos(rotation) - y * Math.sin(rotation);
    const rotatedY = x * Math.sin(rotation) + y * Math.cos(rotation);
    return { x: entry.x + rotatedX, y: entry.y + rotatedY };
  });
}
