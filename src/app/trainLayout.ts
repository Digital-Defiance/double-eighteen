import { DominoValue } from '@/game/DominoValue';
import { TrainBend, TrainBranch } from '@/game/TrainData';

export const DOMINO_WIDTH = 60;
export const DOMINO_HEIGHT = 120;

/**
 * Side-toe angles (degrees) relative to the branch direction for a chicken-foot
 * double. The 0° center toe is the straight main-line continuation and is not
 * listed here; these are the two angled toes that fan off the double's open end.
 */
export const CHICKEN_FOOT_TOE_ANGLES = [-45, 45] as const;

export type TrainLayoutStyle = 'offset' | 'linear';

export interface TrainLayoutEntry {
  x: number;
  y: number;
  rotation: number;
  isDouble: boolean;
  value1: number;
  value2: number;
}

export interface ComputeTrainLayoutInput {
  startX: number;
  startY: number;
  angle: number;
  dominoes: readonly DominoValue[];
  layoutStyle: TrainLayoutStyle;
  dominoWidth?: number;
  dominoHeight?: number;
  /**
   * Distance from (startX, startY) to the center of the first tile, along the
   * train direction. Defaults to a small hub gap; chicken-foot toes pass half a
   * domino-height so the first toe tile butts against the host double's far end.
   */
  leadGap?: number;
  /**
   * Which side the offset zigzag seeds on (+1 / -1). Defaults to the natural
   * outward side for `angle`. Chicken-foot toes override this so each toe's
   * zigzag starts toward the outside of the foot, clear of the center row.
   */
  outwardSign?: number;
  /**
   * Offset mode only: index of a chicken-foot double that should act as a
   * centered hub. The double and the tile feeding into it are snapped onto the
   * train axis (perp 0) so the inbound tile reads as centered on the double and
   * the offset center toe fans out symmetrically — which lets the two angled
   * toes sit at equal, close distances on either side.
   */
  hubIndex?: number;
  /**
   * Pivots that fold this run's path into Ls, Us, or snakes. When present, the
   * run is split into straight sub-runs at each bend index and chained corner to
   * corner. Hub-centering is skipped (corners relax centering by design).
   */
  bends?: readonly TrainBend[];
}

export function halfExtentAlongTrain(
  isDouble: boolean,
  dominoWidth = DOMINO_WIDTH,
  dominoHeight = DOMINO_HEIGHT
): number {
  return isDouble ? dominoWidth / 2 : dominoHeight / 2;
}

export function stepAlongTrain(
  fromIsDouble: boolean,
  toIsDouble: boolean,
  dominoWidth = DOMINO_WIDTH,
  dominoHeight = DOMINO_HEIGHT
): number {
  return (
    halfExtentAlongTrain(fromIsDouble, dominoWidth, dominoHeight) +
    halfExtentAlongTrain(toIsDouble, dominoWidth, dominoHeight)
  );
}

export function trainDirection(angle: number): { dirX: number; dirY: number } {
  const angleRad = (angle * Math.PI) / 180;
  return {
    dirX: Math.cos(angleRad),
    dirY: Math.sin(angleRad),
  };
}

export function trainPerpendicular(angle: number): { perpX: number; perpY: number } {
  const { dirX, dirY } = trainDirection(angle);
  return { perpX: -dirY, perpY: dirX };
}

/**
 * Orients a value chain for rendering so each tile's connecting value (`value1`,
 * the near end) faces the previous tile. A tile is flipped only when it is
 * stored reversed (its `value2`, not `value1`, is the one that matches the
 * previous tile's open end). A correctly-stored chain is left untouched, and
 * doubles are never flipped. This is identical for linear and offset layouts —
 * the connection rule doesn't depend on spacing.
 */
export function orientDominoValues(dominoes: DominoValue[]): DominoValue[] {
  const oriented = dominoes.map((domino) => ({ ...domino }));

  for (let i = 1; i < oriented.length; i++) {
    const domino = oriented[i];
    const prevValue = oriented[i - 1].value2;
    const isDouble = domino.value1 === domino.value2;

    if (!isDouble && domino.value1 !== prevValue && domino.value2 === prevValue) {
      oriented[i] = { value1: domino.value2, value2: domino.value1 };
    }
  }

  return oriented;
}

export function outwardPerpSign(angle: number): number {
  const { dirX, dirY } = trainDirection(angle);

  if (Math.abs(dirX) >= Math.abs(dirY)) {
    return dirX >= 0 ? 1 : -1;
  }

  return dirY >= 0 ? 1 : -1;
}

export function nextPerpOffset(current: number, outwardSign: number): number {
  if (current === 0) {
    return outwardSign;
  }

  return current === outwardSign ? -outwardSign : outwardSign;
}

interface PlaceOrientedRunInput {
  orientedDominoes: readonly DominoValue[];
  startX: number;
  startY: number;
  angle: number;
  layoutStyle: TrainLayoutStyle;
  dominoWidth: number;
  dominoHeight: number;
  leadGap: number;
  outwardSign: number;
  hubIndex?: number;
}

/**
 * Places an already value-oriented run of dominoes along a single straight
 * heading. This is the geometric core shared by straight runs and by each
 * sub-run of a bent (folded) path; it never re-orients tiles, so callers that
 * split a run at bends can orient the whole value-chain once and still keep
 * like-values touching across every corner.
 */
function placeOrientedRun({
  orientedDominoes,
  startX,
  startY,
  angle,
  layoutStyle,
  dominoWidth,
  dominoHeight,
  leadGap,
  outwardSign,
  hubIndex,
}: PlaceOrientedRunInput): TrainLayoutEntry[] {
  const layout: TrainLayoutEntry[] = [];
  const { dirX, dirY } = trainDirection(angle);
  const { perpX, perpY } = trainPerpendicular(angle);
  const isHub = layoutStyle === 'offset' && hubIndex != null;
  // Lane (perpStep units) of each placed tile, used to recenter the inbound run
  // onto the hub double afterward.
  const laneByIndex: number[] = [];

  let currentX = startX + dirX * leadGap;
  let currentY = startY + dirY * leadGap;
  let perpOffset = 0;
  // Lane (in perpStep units) of the current tile. Regular tiles brick by
  // flipping lanes; a double stays in the lane of the tile it connects to, and
  // the tile coming out of the double stays in that lane too — so the run out
  // of a double mirrors the run into it and the train holds two fixed rows.
  let laneSign = 0;

  // Regular tiles alternate half a domino-width to each side of the centerline
  // so the two rows touch along the spine (no gap) and interlock cleanly.
  const perpStep = dominoWidth / 2;

  // perpOffset is the current net perpendicular position in units of perpStep.
  // Moving to a new lane steps by the delta.
  const setPerpOffset = (target: number) => {
    const delta = (target - perpOffset) * perpStep;
    currentX += perpX * delta;
    currentY += perpY * delta;
    perpOffset = target;
  };

  for (let i = 0; i < orientedDominoes.length; i++) {
    const domino = orientedDominoes[i];
    const isDouble = domino.value1 === domino.value2;
    const prevIsDouble =
      i > 0 &&
      orientedDominoes[i - 1].value1 === orientedDominoes[i - 1].value2;

    if (layoutStyle === 'linear') {
      if (i > 0) {
        if (isDouble) {
          currentX += dirX * stepAlongTrain(prevIsDouble, true, dominoWidth, dominoHeight);
          currentY += dirY * stepAlongTrain(prevIsDouble, true, dominoWidth, dominoHeight);
        } else if (prevIsDouble) {
          currentX += dirX * stepAlongTrain(true, false, dominoWidth, dominoHeight);
          currentY += dirY * stepAlongTrain(true, false, dominoWidth, dominoHeight);
        } else {
          currentX += dirX * dominoHeight;
          currentY += dirY * dominoHeight;
        }
      }
    } else if (isDouble) {
      // A double aligns with the tile it connects to: it stays in the current
      // lane (no perpendicular move) and only advances along the train.
      if (i > 0) {
        currentX += dirX * stepAlongTrain(prevIsDouble, true, dominoWidth, dominoHeight);
        currentY += dirY * stepAlongTrain(prevIsDouble, true, dominoWidth, dominoHeight);
      }
    } else {
      // Regular tile.
      if (i === 0) {
        laneSign = outwardSign;
      } else if (prevIsDouble) {
        // First tile out of a double: stay in the double's lane (centered on
        // it), so the outro mirrors the intro. Advance along only.
        currentX += dirX * stepAlongTrain(true, false, dominoWidth, dominoHeight);
        currentY += dirY * stepAlongTrain(true, false, dominoWidth, dominoHeight);
      } else {
        // Brick against the previous regular: flip lanes, overlap 50% along.
        currentX += dirX * (dominoHeight / 2);
        currentY += dirY * (dominoHeight / 2);
        laneSign = nextPerpOffset(laneSign, outwardSign);
      }

      setPerpOffset(laneSign);
    }

    laneByIndex.push(perpOffset);

    layout.push({
      x: currentX,
      y: currentY,
      rotation: isDouble ? angle + 180 : angle - 90,
      isDouble,
      value1: domino.value1,
      value2: domino.value2,
    });
  }

  // Center the hub double on the train axis by rigidly sliding the whole run
  // perpendicular. Because the inbound tile, the double, and the outgoing tile
  // all share the double's lane, this lands all three on the axis (each reads as
  // centered on the double) while the offset zigzag — and the no-overlap
  // guarantee of the original lattice — is preserved. The center toe still fans
  // off-axis, so the two angled toes end up symmetric and close on either side.
  if (isHub && hubIndex != null) {
    const shift = -laneByIndex[hubIndex] * perpStep;
    if (shift !== 0) {
      for (let i = 0; i < layout.length; i++) {
        layout[i] = {
          ...layout[i],
          x: layout[i].x + perpX * shift,
          y: layout[i].y + perpY * shift,
        };
      }
    }
  }

  return layout;
}

/**
 * Normalizes a run's bends: integer indices strictly inside the run, one per
 * index (last wins), sorted. Index 0 is dropped — a run can't bend before its
 * first tile. Returns the cleaned, sorted list.
 */
export function normalizeBends(
  bends: readonly TrainBend[] | undefined,
  tileCount: number
): TrainBend[] {
  if (!bends || bends.length === 0) return [];
  const byIndex = new Map<number, number>();
  for (const bend of bends) {
    if (!Number.isInteger(bend.index)) continue;
    if (bend.index <= 0 || bend.index >= tileCount) continue;
    byIndex.set(bend.index, bend.turn);
  }
  return [...byIndex.entries()]
    .map(([index, turn]) => ({ index, turn }))
    .sort((a, b) => a.index - b.index);
}

/**
 * Local heading (degrees) of the tile at `index` in a (possibly bent) run: the
 * base `angle` plus every bend turn at or before that index. With no bends this
 * is just `angle`. Used to anchor chicken-foot toes off a double's *actual*
 * heading when the double sits in a turned section of the path.
 */
export function headingAtIndex(
  angle: number,
  bends: readonly TrainBend[] | undefined,
  index: number,
  tileCount = Infinity
): number {
  const cleaned = normalizeBends(bends, Number.isFinite(tileCount) ? tileCount : index + 1);
  let heading = angle;
  for (const bend of cleaned) {
    if (bend.index <= index) heading += bend.turn;
    else break;
  }
  return heading;
}

/**
 * Lays out a run that folds at one or more bends. The whole value-chain is
 * oriented once (so like-values keep touching), then split into straight
 * sub-runs at each bend index. Each post-bend sub-run is anchored at the open
 * end of the previous sub-run's last tile and turned by the bend's angle.
 *
 * Corner handling: a perpendicular tile butted straight onto the prior tile's
 * end would overlap it by a quarter-tile, so each post-bend sub-run is nudged
 * half a tile-width along the *previous* heading. That converts the would-be
 * overlap into a clean edge/point touch at the corner while the connecting pips
 * still meet. Centering relaxes at corners (tiles bunch) — by design.
 */
function placeBentRun(
  orientedDominoes: readonly DominoValue[],
  input: Required<
    Pick<
      ComputeTrainLayoutInput,
      'startX' | 'startY' | 'angle' | 'layoutStyle' | 'dominoWidth' | 'dominoHeight' | 'leadGap' | 'outwardSign'
    >
  >,
  bends: readonly TrainBend[],
  hubIndex?: number
): TrainLayoutEntry[] {
  const { startX, startY, angle, layoutStyle, dominoWidth, dominoHeight, leadGap, outwardSign } = input;
  const boundaries = [0, ...bends.map((b) => b.index), orientedDominoes.length];

  const result: TrainLayoutEntry[] = [];
  let heading = angle;
  let subStartX = startX;
  let subStartY = startY;
  let subLeadGap = leadGap;

  for (let s = 0; s < boundaries.length - 1; s++) {
    const slice = orientedDominoes.slice(boundaries[s], boundaries[s + 1]);
    if (slice.length === 0) continue;

    // Keep the hub double centered as long as it lives in the first (pre-bend)
    // sub-run: this preserves the straight-run vertical position so a bend
    // elsewhere doesn't shift the whole train and spuriously collide. Later
    // sub-runs chain off this centered run, so they follow along.
    const subHubIndex =
      s === 0 && hubIndex != null && hubIndex < boundaries[1] ? hubIndex : undefined;

    const sub = placeOrientedRun({
      orientedDominoes: slice,
      startX: subStartX,
      startY: subStartY,
      angle: heading,
      layoutStyle,
      dominoWidth,
      dominoHeight,
      leadGap: subLeadGap,
      outwardSign,
      hubIndex: subHubIndex,
    });
    result.push(...sub);

    const isLastSub = s >= boundaries.length - 2;
    if (isLastSub) break;

    // Chain the next sub-run off this one's open end, turned by the bend angle.
    const last = sub[sub.length - 1];
    const prevDir = trainDirection(heading);
    const halfPrev = halfExtentAlongTrain(last.isDouble, dominoWidth, dominoHeight);

    heading += bends[s].turn;
    const nextFirst = orientedDominoes[boundaries[s + 1]];
    const nextIsDouble = nextFirst.value1 === nextFirst.value2;
    const halfNext = halfExtentAlongTrain(nextIsDouble, dominoWidth, dominoHeight);
    const nextDir = trainDirection(heading);
    const nextPerp = trainPerpendicular(heading);
    const perpStep = dominoWidth / 2;

    // Land the next sub-run's first tile so its connecting half sits edge-flush
    // against the previous tile's open half — a clean L corner where the matching
    // pips fully touch. Pull a half-width back along the previous heading (into
    // the corner) and advance an extra half-width along the new heading so the
    // turning tile clears the previous tile's body instead of overlapping it.
    const targetX =
      last.x + prevDir.dirX * (halfPrev - perpStep) + nextDir.dirX * (halfNext + perpStep);
    const targetY =
      last.y + prevDir.dirY * (halfPrev - perpStep) + nextDir.dirY * (halfNext + perpStep);

    // In offset mode placeOrientedRun seeds a regular first tile a half-width
    // into its outward lane; pre-cancel that so the tile lands exactly on the
    // target. Linear runs and doubles get no perpendicular seed.
    const seeds = layoutStyle === 'offset' && !nextIsDouble;
    const seedX = seeds ? nextPerp.perpX * perpStep * outwardSign : 0;
    const seedY = seeds ? nextPerp.perpY * perpStep * outwardSign : 0;

    subStartX = targetX - seedX;
    subStartY = targetY - seedY;
    subLeadGap = 0;
  }

  return result;
}

export function computeTrainLayout({
  startX,
  startY,
  angle,
  dominoes,
  layoutStyle,
  dominoWidth = DOMINO_WIDTH,
  dominoHeight = DOMINO_HEIGHT,
  leadGap = dominoHeight * 0.3,
  outwardSign: outwardSignInput,
  hubIndex,
  bends,
}: ComputeTrainLayoutInput): TrainLayoutEntry[] {
  const orientedDominoes = orientDominoValues([...dominoes]);
  const outwardSign = outwardSignInput ?? outwardPerpSign(angle);

  const cleanedBends = normalizeBends(bends, orientedDominoes.length);
  if (cleanedBends.length > 0) {
    // Hub-centering still applies to the pre-bend sub-run (so a bend doesn't
    // shift the whole train); corners past it relax centering by design.
    return placeBentRun(
      orientedDominoes,
      {
        startX,
        startY,
        angle,
        layoutStyle,
        dominoWidth,
        dominoHeight,
        leadGap,
        outwardSign,
      },
      cleanedBends,
      hubIndex
    );
  }

  return placeOrientedRun({
    orientedDominoes,
    startX,
    startY,
    angle,
    layoutStyle,
    dominoWidth,
    dominoHeight,
    leadGap,
    outwardSign,
    hubIndex,
  });
}

/** The four world-space corners of a tile (its rotated rectangle). */
export function tileCorners(
  entry: TrainLayoutEntry,
  dominoWidth = DOMINO_WIDTH,
  dominoHeight = DOMINO_HEIGHT
): Array<{ x: number; y: number }> {
  const r = (entry.rotation * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  const hw = dominoWidth / 2;
  const hh = dominoHeight / 2;
  return [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh],
  ].map(([x, y]) => ({
    x: entry.x + x * cos - y * sin,
    y: entry.y + x * sin + y * cos,
  }));
}

function projectionGap(
  a: Array<{ x: number; y: number }>,
  b: Array<{ x: number; y: number }>,
  axis: { x: number; y: number }
): number {
  let aMin = Infinity;
  let aMax = -Infinity;
  let bMin = Infinity;
  let bMax = -Infinity;
  for (const p of a) {
    const d = p.x * axis.x + p.y * axis.y;
    aMin = Math.min(aMin, d);
    aMax = Math.max(aMax, d);
  }
  for (const p of b) {
    const d = p.x * axis.x + p.y * axis.y;
    bMin = Math.min(bMin, d);
    bMax = Math.max(bMax, d);
  }
  return Math.min(aMax, bMax) - Math.max(aMin, bMin);
}

/**
 * True when two tiles physically overlap (separating-axis test on their rotated
 * rectangles). Tiles that merely touch (within `epsilon`) are not overlapping,
 * so legitimately adjacent dominoes — bricked, end-to-end, or butted against a
 * double — pass cleanly while real collisions are caught.
 */
export function tilesOverlap(
  a: TrainLayoutEntry,
  b: TrainLayoutEntry,
  epsilon = 1,
  dominoWidth = DOMINO_WIDTH,
  dominoHeight = DOMINO_HEIGHT
): boolean {
  const ca = tileCorners(a, dominoWidth, dominoHeight);
  const cb = tileCorners(b, dominoWidth, dominoHeight);
  for (const corners of [ca, cb]) {
    for (let i = 0; i < 4; i++) {
      const p = corners[i];
      const q = corners[(i + 1) % 4];
      const ex = q.x - p.x;
      const ey = q.y - p.y;
      const len = Math.hypot(ex, ey) || 1;
      const axis = { x: -ey / len, y: ex / len };
      if (projectionGap(ca, cb, axis) <= epsilon) {
        return false;
      }
    }
  }
  return true;
}

function overlapsAny(
  tile: TrainLayoutEntry,
  others: readonly TrainLayoutEntry[],
  dominoWidth: number,
  dominoHeight: number
): boolean {
  return others.some((other) =>
    tilesOverlap(tile, other, 1, dominoWidth, dominoHeight)
  );
}

/**
 * True when any tile of `layout` overlaps any tile in `obstacles` — i.e. this
 * path would physically intersect another path. Used to forbid a bend that
 * would cross another train.
 */
export function layoutsCollide(
  layout: readonly TrainLayoutEntry[],
  obstacles: readonly TrainLayoutEntry[],
  epsilon = 1,
  dominoWidth = DOMINO_WIDTH,
  dominoHeight = DOMINO_HEIGHT
): boolean {
  return layout.some((tile) =>
    obstacles.some((other) =>
      tilesOverlap(tile, other, epsilon, dominoWidth, dominoHeight)
    )
  );
}

/**
 * True when a path crosses itself — any two of its own tiles overlap. Adjacent
 * tiles that merely touch are fine (tilesOverlap ignores contact), so this only
 * fires when a fold (e.g. a too-tight U-turn) makes the path collide with itself.
 */
export function layoutSelfIntersects(
  layout: readonly TrainLayoutEntry[],
  epsilon = 1,
  dominoWidth = DOMINO_WIDTH,
  dominoHeight = DOMINO_HEIGHT
): boolean {
  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) {
      if (tilesOverlap(layout[i], layout[j], epsilon, dominoWidth, dominoHeight)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * A single straight run of dominoes within a chicken-foot tree: the main line
 * or one toe. `depth` is 0 for the main line, 1 for its toes, and so on.
 */
export interface TrainSegment {
  angle: number;
  depth: number;
  layoutStyle: TrainLayoutStyle;
  /** Outward side this segment's zigzag seeds on (needed to re-derive layout). */
  outwardSign: number;
  dominoes: readonly DominoValue[];
  layout: TrainLayoutEntry[];
  /** Anchor point this segment hangs off (host double's open end), if any. */
  anchor?: { x: number; y: number };
}

export interface ComputeTrainTreeInput {
  startX: number;
  startY: number;
  angle: number;
  branch: TrainBranch;
  layoutStyle: TrainLayoutStyle;
  dominoWidth?: number;
  dominoHeight?: number;
  leadGap?: number;
  depth?: number;
  anchor?: { x: number; y: number };
  outwardSign?: number;
  /**
   * Accumulator of every tile already placed in the tree. Toes are nudged
   * outward until they clear everything in here, so no two dominoes overlap.
   * Callers normally omit this; the recursion threads it through.
   */
  placed?: TrainLayoutEntry[];
  /**
   * Unit direction a toe may be nudged along (outward, parallel to the host
   * double's open edge) to resolve overlaps. The trunk passes none.
   */
  pushAxis?: { x: number; y: number };
  /**
   * Minimum number of nudge steps to apply before checking for clearance. Both
   * toes of a foot share this so they stay symmetric about the double even when
   * only one side is crowded by the offset center toe.
   */
  minPushSteps?: number;
}

/** Outward nudge increment and cap used to space chicken-foot toes apart. */
const TOE_PUSH_STEP = DOMINO_WIDTH / 4;
const TOE_PUSH_MAX_STEPS = 24;

/**
 * Lays out a branch and, recursively, the chicken-foot side toes hanging off any
 * of its doubles. Returns a flat list of segments (main line first, then toes in
 * depth-first order) so callers can render every tile and validate each run.
 */
export function computeTrainTree({
  startX,
  startY,
  angle,
  branch,
  layoutStyle,
  dominoWidth = DOMINO_WIDTH,
  dominoHeight = DOMINO_HEIGHT,
  leadGap,
  depth = 0,
  anchor,
  outwardSign,
  placed = [],
  pushAxis,
  minPushSteps = 0,
}: ComputeTrainTreeInput): TrainSegment[] {
  const segmentOutward = outwardSign ?? outwardPerpSign(angle);

  // The first double that sprouts a foot becomes a centered hub so its inbound
  // tile reads centered and its two angled toes stay symmetric.
  const hubIndex = branch.feet
    ? Object.keys(branch.feet)
        .map(Number)
        .filter((index) => {
          const tile = branch.dominoes[index];
          return tile && tile.value1 === tile.value2;
        })
        .sort((a, b) => a - b)[0]
    : undefined;

  const buildLayout = (originX: number, originY: number) =>
    computeTrainLayout({
      startX: originX,
      startY: originY,
      angle,
      dominoes: branch.dominoes,
      layoutStyle,
      dominoWidth,
      dominoHeight,
      leadGap,
      outwardSign: segmentOutward,
      hubIndex,
      bends: branch.bends,
    });

  // Nudge this run outward (only toes get a pushAxis) until none of its tiles
  // overlap anything already placed, so dominoes never sit on top of each other.
  // Start from minPushSteps so a foot's two toes share a nudge and stay symmetric.
  let layout = buildLayout(
    startX + (pushAxis?.x ?? 0) * TOE_PUSH_STEP * minPushSteps,
    startY + (pushAxis?.y ?? 0) * TOE_PUSH_STEP * minPushSteps
  );
  let appliedAnchor =
    anchor && pushAxis
      ? {
          x: anchor.x + pushAxis.x * TOE_PUSH_STEP * minPushSteps,
          y: anchor.y + pushAxis.y * TOE_PUSH_STEP * minPushSteps,
        }
      : anchor;
  if (pushAxis && placed.length > 0) {
    for (let k = minPushSteps; k <= TOE_PUSH_MAX_STEPS; k++) {
      const originX = startX + pushAxis.x * TOE_PUSH_STEP * k;
      const originY = startY + pushAxis.y * TOE_PUSH_STEP * k;
      const trial = buildLayout(originX, originY);
      const clear = !trial.some((tile) =>
        overlapsAny(tile, placed, dominoWidth, dominoHeight)
      );
      if (clear || k === TOE_PUSH_MAX_STEPS) {
        layout = trial;
        appliedAnchor = anchor
          ? {
              x: anchor.x + pushAxis.x * TOE_PUSH_STEP * k,
              y: anchor.y + pushAxis.y * TOE_PUSH_STEP * k,
            }
          : anchor;
        break;
      }
    }
  }

  placed.push(...layout);

  const segments: TrainSegment[] = [
    {
      angle,
      depth,
      layoutStyle,
      outwardSign: segmentOutward,
      dominoes: branch.dominoes,
      layout,
      anchor: appliedAnchor,
    },
  ];

  if (branch.feet) {
    const perpStep = dominoWidth / 2;
    const leadGap = dominoHeight / 2;

    for (const key of Object.keys(branch.feet)) {
      const hostIndex = Number(key);
      const host = layout[hostIndex];
      const toes = branch.feet[hostIndex];
      if (!host || !host.isDouble || !toes) {
        continue;
      }

      // Anchor toes off the double's LOCAL heading so a double inside a bent
      // section fans its toes relative to the turned path, not the base angle.
      const hostAngle = headingAtIndex(
        angle,
        branch.bends,
        hostIndex,
        branch.dominoes.length
      );
      const { dirX, dirY } = trainDirection(hostAngle);
      const { perpX, perpY } = trainPerpendicular(hostAngle);

      for (let toeIndex = 0; toeIndex < toes.length; toeIndex++) {
        const toe = toes[toeIndex];
        const toeOffset = CHICKEN_FOOT_TOE_ANGLES[toeIndex] ?? 0;
        const sideSign = Math.sign(toeOffset);
        const toeAngle = hostAngle + toeOffset;
        const toePerp = trainPerpendicular(toeAngle);
        // Seed the zigzag on the toe's INNER lane so each toe splays outward
        // (away from the center toe) as it extends rather than curling in.
        const outward = -sideSign;

        // The double's open corner on this toe's side: half a domino-width out
        // along the train, half a domino-height across to the corner.
        const cornerX =
          host.x + dirX * (dominoWidth / 2) + perpX * (dominoHeight / 2) * sideSign;
        const cornerY =
          host.y + dirY * (dominoWidth / 2) + perpY * (dominoHeight / 2) * sideSign;

        // Snug placement: the first toe tile butts its inner edge midpoint
        // against that corner (its center lands at corner + toeDir * leadGap).
        // Pick the origin so the offset seed cancels and that lands exactly.
        const originX = cornerX - toePerp.perpX * outward * perpStep;
        const originY = cornerY - toePerp.perpY * outward * perpStep;

        segments.push(
          ...computeTrainTree({
            startX: originX,
            startY: originY,
            angle: toeAngle,
            branch: toe,
            // Toes inherit the main style so they zigzag in offset mode.
            layoutStyle,
            dominoWidth,
            dominoHeight,
            leadGap,
            outwardSign: outward,
            depth: depth + 1,
            anchor: { x: originX, y: originY },
            placed,
            // If the snug spot is still blocked (the offset center toe leans into
            // one side), slide this toe along the double's open edge, away from
            // center, until it clears. This keeps it butted against the double
            // while stepping past the obstacle — independent per toe, so a foot
            // ends up snug and only as asymmetric as the obstruction requires.
            pushAxis: { x: perpX * sideSign, y: perpY * sideSign },
          })
        );
      }
    }
  }

  return segments;
}

/** Flattens a list of segments into a single list of tiles for rendering. */
export function flattenSegments(
  segments: readonly TrainSegment[]
): TrainLayoutEntry[] {
  return segments.flatMap((segment) => segment.layout);
}

export interface TrainLayoutBounds {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

/** Bounding box for rendering a train layout on a felt canvas. */
export function getTrainLayoutBounds(
  layout: readonly TrainLayoutEntry[],
  padding = 24,
  dominoWidth = DOMINO_WIDTH,
  dominoHeight = DOMINO_HEIGHT
): TrainLayoutBounds {
  const halfExtent = Math.hypot(dominoWidth, dominoHeight) / 2;

  if (layout.length === 0) {
    return {
      width: padding * 2 + dominoWidth,
      height: padding * 2 + dominoHeight,
      offsetX: padding,
      offsetY: padding,
    };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const entry of layout) {
    minX = Math.min(minX, entry.x - halfExtent);
    minY = Math.min(minY, entry.y - halfExtent);
    maxX = Math.max(maxX, entry.x + halfExtent);
    maxY = Math.max(maxY, entry.y + halfExtent);
  }

  return {
    width: Math.ceil(maxX - minX + padding * 2),
    height: Math.ceil(maxY - minY + padding * 2),
    offsetX: padding - minX,
    offsetY: padding - minY,
  };
}
