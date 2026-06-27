import { TrainBranch } from '@/game/TrainData';
import {
  DOMINO_WIDTH,
  TrainLayoutEntry,
  computeTrainLayout,
  computeTrainTree,
  flattenSegments,
  halfExtentAlongTrain,
  headingAtIndex,
  layoutSelfIntersects,
  layoutsCollide,
  normalizeBends,
  tilesOverlap,
  trainDirection,
  trainPerpendicular,
} from './trainLayout';
import {
  buildBranchTiles,
  cycleBendAt,
  linearDefaultSide,
  offsetDefaultSide,
  oppositeSide,
  resolveBend,
  sideToTurn,
  withBendAt,
} from './trainBends';

const chain = (...vals: number[]) =>
  vals.slice(0, -1).map((v, i) => ({ value1: v, value2: vals[i + 1] }));

// A six-tile, double-free run so orientation is unambiguous.
const SIX = chain(12, 6, 5, 4, 3, 2, 1);

const layoutFor = (bendTurn?: number, style: 'linear' | 'offset' = 'linear') =>
  computeTrainLayout({
    startX: 100,
    startY: 100,
    angle: 0,
    dominoes: SIX,
    layoutStyle: style,
    ...(bendTurn != null ? { bends: [{ index: 3, turn: bendTurn }] } : {}),
  });

describe('bent run geometry', () => {
  it('preserves tile count and order', () => {
    expect(layoutFor(90)).toHaveLength(SIX.length);
  });

  it('places the pre-bend sub-run identically to an unbent run', () => {
    const straight = layoutFor(undefined);
    const bent = layoutFor(90);
    for (let i = 0; i < 3; i++) {
      expect(bent[i].x).toBeCloseTo(straight[i].x, 6);
      expect(bent[i].y).toBeCloseTo(straight[i].y, 6);
      expect(bent[i].rotation).toBe(straight[i].rotation);
    }
  });

  it('changes heading after the bend', () => {
    const straight = layoutFor(undefined);
    const bent = layoutFor(90);
    // Unbent stays on y≈100; a +90 (downward) turn drives later tiles to y>100.
    expect(straight[5].y).toBeCloseTo(100, 6);
    expect(bent[5].y).toBeGreaterThan(140);
  });

  it('seats the connecting halves edge-flush across the corner (clean L)', () => {
    const bent = layoutFor(90);
    const k = 3;
    const prev = bent[k - 1];
    const next = bent[k];
    const prevDir = trainDirection(0);
    const nextDir = trainDirection(90);
    const half = DOMINO_WIDTH / 2;
    // Center of the previous tile's open half-square and the next tile's near
    // half-square. A clean L seats them exactly one tile-width apart and aligned
    // along the new heading, i.e. they share a full edge (matching pips touch).
    const prevHalf = {
      x: prev.x + prevDir.dirX * (halfExtentAlongTrain(prev.isDouble) - half),
      y: prev.y + prevDir.dirY * (halfExtentAlongTrain(prev.isDouble) - half),
    };
    const nextHalf = {
      x: next.x - nextDir.dirX * (halfExtentAlongTrain(next.isDouble) - half),
      y: next.y - nextDir.dirY * (halfExtentAlongTrain(next.isDouble) - half),
    };
    const gap = Math.hypot(prevHalf.x - nextHalf.x, prevHalf.y - nextHalf.y);
    expect(gap).toBeCloseTo(DOMINO_WIDTH, 6);
    // The offset between the two half-centers is purely along the new heading
    // (perpendicular component ~0) → the squares are edge-aligned, not diagonal.
    const dx = nextHalf.x - prevHalf.x;
    const dy = nextHalf.y - prevHalf.y;
    const perp = trainPerpendicular(90);
    expect(Math.abs(dx * perp.perpX + dy * perp.perpY)).toBeCloseTo(0, 6);
  });

  it('does not overlap itself for a comfortable L-bend (both styles)', () => {
    expect(layoutSelfIntersects(layoutFor(90, 'linear'))).toBe(false);
    expect(layoutSelfIntersects(layoutFor(-90, 'linear'))).toBe(false);
    expect(layoutSelfIntersects(layoutFor(90, 'offset'))).toBe(false);
    expect(layoutSelfIntersects(layoutFor(-90, 'offset'))).toBe(false);
  });

  it('the corner tiles touch but do not overlap', () => {
    const bent = layoutFor(90);
    expect(tilesOverlap(bent[2], bent[3])).toBe(false);
  });

  it('supports multiple bends (a U-turn) when there is room', () => {
    const long = chain(12, 6, 5, 4, 3, 2, 1, 0, 7, 8, 9);
    const u = computeTrainLayout({
      startX: 100,
      startY: 100,
      angle: 0,
      dominoes: long,
      layoutStyle: 'linear',
      bends: [
        { index: 3, turn: 90 },
        { index: 6, turn: 90 },
      ],
    });
    expect(u).toHaveLength(long.length);
    // Two same-direction 90s reverse the heading: the tail runs back toward -x.
    expect(u[long.length - 1].x).toBeLessThan(u[5].x);
    expect(layoutSelfIntersects(u)).toBe(false);
  });

  it('flags a path that crosses itself', () => {
    const tile = (x: number, y: number): TrainLayoutEntry => ({
      x,
      y,
      rotation: 0,
      isDouble: false,
      value1: 1,
      value2: 2,
    });
    // Two tiles on top of each other → self-intersection; far apart → none.
    expect(layoutSelfIntersects([tile(0, 0), tile(15, 15)])).toBe(true);
    expect(layoutSelfIntersects([tile(0, 0), tile(1000, 0)])).toBe(false);
  });
});

describe('chicken-foot toes on a bent run', () => {
  // The run turns +90 at index 1; a double with feet sits at index 3, a couple
  // tiles into the turned sub-run. Its toes must fan relative to the turned
  // heading (90°), not the base heading (0°).
  const branch = {
    dominoes: [
      { value1: 12, value2: 6 },
      { value1: 6, value2: 5 },
      { value1: 5, value2: 4 },
      { value1: 4, value2: 4 },
      { value1: 4, value2: 3 },
      { value1: 3, value2: 2 },
    ],
    bends: [{ index: 1, turn: 90 }],
    feet: {
      3: [
        { dominoes: [{ value1: 4, value2: 1 }] },
        { dominoes: [{ value1: 4, value2: 0 }] },
      ],
    },
  };

  it('reports the local heading at a bent index', () => {
    expect(headingAtIndex(0, branch.bends, 0)).toBe(0);
    expect(headingAtIndex(0, branch.bends, 1)).toBe(90);
    expect(headingAtIndex(0, branch.bends, 3)).toBe(90);
  });

  it('anchors toe segments off the host double\u2019s turned heading', () => {
    const segments = computeTrainTree({
      startX: 200,
      startY: 200,
      angle: 0,
      branch,
      layoutStyle: 'offset',
    });
    const toeSegments = segments.filter((s) => s.depth === 1);
    expect(toeSegments).toHaveLength(2);
    // Host heading is 90°; toes fan at 90 + (-45) and 90 + 45.
    const toeAngles = toeSegments.map((s) => s.angle).sort((a, b) => a - b);
    expect(toeAngles).toEqual([45, 135]);
  });

  it('does not shift the hub-centered run when a later tile bends', () => {
    const base = computeTrainTree({
      startX: 200,
      startY: 200,
      angle: 0,
      branch: { dominoes: branch.dominoes, feet: branch.feet },
      layoutStyle: 'offset',
    })[0].layout;
    const bentLastIndex = branch.dominoes.length - 1;
    const bent = computeTrainTree({
      startX: 200,
      startY: 200,
      angle: 0,
      branch: {
        dominoes: branch.dominoes,
        feet: branch.feet,
        bends: [{ index: bentLastIndex, turn: 90 }],
      },
      layoutStyle: 'offset',
    })[0].layout;
    // Every tile before the bend keeps its exact position (hub centering held),
    // so a far-away bend can't lift the whole train into a spurious collision.
    for (let i = 0; i < bentLastIndex; i++) {
      expect(bent[i].x).toBeCloseTo(base[i].x, 6);
      expect(bent[i].y).toBeCloseTo(base[i].y, 6);
    }
  });

  it('keeps the whole bent chicken-foot tree overlap-free', () => {
    const segments = computeTrainTree({
      startX: 200,
      startY: 200,
      angle: 0,
      branch,
      layoutStyle: 'offset',
    });
    expect(layoutSelfIntersects(flattenSegments(segments))).toBe(false);
  });
});

describe('layoutsCollide', () => {
  const a = layoutFor(undefined);

  it('is false for well-separated paths', () => {
    const far = computeTrainLayout({
      startX: 100,
      startY: 1000,
      angle: 0,
      dominoes: SIX,
      layoutStyle: 'linear',
    });
    expect(layoutsCollide(a, far)).toBe(false);
  });

  it('is true for overlapping paths', () => {
    const overlapping = computeTrainLayout({
      startX: 100,
      startY: 100,
      angle: 90,
      dominoes: SIX,
      layoutStyle: 'linear',
    });
    expect(layoutsCollide(a, overlapping)).toBe(true);
  });
});

describe('withBendAt', () => {
  it('adds, replaces, and removes bends by index, keeping sorted order', () => {
    let bends = withBendAt(undefined, 3, 90);
    expect(bends).toEqual([{ index: 3, turn: 90 }]);
    bends = withBendAt(bends, 1, -90);
    expect(bends.map((b) => b.index)).toEqual([1, 3]);
    bends = withBendAt(bends, 3, 90 + 1); // replace
    expect(bends.find((b) => b.index === 3)?.turn).toBe(91);
    bends = withBendAt(bends, 3, null); // remove
    expect(bends.map((b) => b.index)).toEqual([1]);
  });
});

describe('default turn heuristics', () => {
  it('offset folds toward the empty side (opposite the zigzag bias)', () => {
    // angle 0 → outwardSign +1 → empty side is left.
    expect(offsetDefaultSide(0, 1)).toBe('left');
    expect(offsetDefaultSide(0, -1)).toBe('right');
  });

  it('linear folds toward the side with more table room', () => {
    // Heading east near the top edge → more room below (perp +y = "right").
    expect(
      linearDefaultSide({ x: 500, y: 50 }, 0, { width: 1000, height: 1000 })
    ).toBe('right');
    // Near the bottom edge → more room above ("left").
    expect(
      linearDefaultSide({ x: 500, y: 950 }, 0, { width: 1000, height: 1000 })
    ).toBe('left');
  });

  it('sideToTurn/oppositeSide map sides to signed degrees', () => {
    expect(sideToTurn('right')).toBe(90);
    expect(sideToTurn('left')).toBe(-90);
    expect(oppositeSide('right')).toBe('left');
  });
});

describe('resolveBend collision guard', () => {
  const branch: TrainBranch = { dominoes: SIX };
  const build = { startX: 100, startY: 100, angle: 0, layoutStyle: 'linear' as const };

  // Only the post-bend tiles are unique to a turn direction; the pre-bend prefix
  // is shared by every candidate, so obstacles must exclude it to model a
  // genuinely separate path.
  const turnedTiles = (turn: number): TrainLayoutEntry[] =>
    buildBranchTiles(
      { ...branch, bends: withBendAt(branch.bends, 3, turn) },
      build
    ).slice(3);

  it('takes the preferred side when nothing is in the way', () => {
    const result = resolveBend({
      branch,
      index: 3,
      build,
      obstacles: [],
      preferredSide: 'right',
    });
    expect(result.turn).toBe(sideToTurn('right'));
  });

  it('falls back to the opposite side when the preferred one collides', () => {
    const blockingRight = turnedTiles(sideToTurn('right'));
    const result = resolveBend({
      branch,
      index: 3,
      build,
      obstacles: blockingRight,
      preferredSide: 'right',
    });
    expect(result.turn).toBe(sideToTurn('left'));
  });

  it('refuses the bend when both sides collide', () => {
    const obstacles = [
      ...turnedTiles(sideToTurn('right')),
      ...turnedTiles(sideToTurn('left')),
    ];
    const result = resolveBend({
      branch,
      index: 3,
      build,
      obstacles,
      preferredSide: 'right',
    });
    expect(result.turn).toBeNull();
    expect(result.reason).toBe('blocked');
  });
});

describe('cycleBendAt', () => {
  const branch: TrainBranch = { dominoes: SIX };
  const build = { startX: 100, startY: 100, angle: 0, layoutStyle: 'linear' as const };

  it('cycles none → preferred → opposite → none on repeated clicks', () => {
    const step1 = cycleBendAt(branch, 3, build, [], 'right');
    expect(step1.bends.find((b) => b.index === 3)?.turn).toBe(sideToTurn('right'));

    const step2 = cycleBendAt({ ...branch, bends: step1.bends }, 3, build, [], 'right');
    expect(step2.bends.find((b) => b.index === 3)?.turn).toBe(sideToTurn('left'));

    const step3 = cycleBendAt({ ...branch, bends: step2.bends }, 3, build, [], 'right');
    expect(step3.bends.find((b) => b.index === 3)).toBeUndefined();
  });

  it('reports blocked when no legal bend exists at the index', () => {
    const blocking = [
      ...buildBranchTiles({ ...branch, bends: [{ index: 3, turn: 90 }] }, build).slice(3),
      ...buildBranchTiles({ ...branch, bends: [{ index: 3, turn: -90 }] }, build).slice(3),
    ];
    const result = cycleBendAt(branch, 3, build, blocking, 'right');
    expect(result.changed).toBe(false);
    expect(result.blocked).toBe(true);
  });
});

describe('normalizeBends', () => {
  it('returns an empty list for missing or empty input', () => {
    expect(normalizeBends(undefined, 6)).toEqual([]);
    expect(normalizeBends([], 6)).toEqual([]);
  });

  it('drops a bend at index 0 (the first tile cannot turn)', () => {
    expect(normalizeBends([{ index: 0, turn: 90 }], 6)).toEqual([]);
  });

  it('drops bends that fall outside the tile range', () => {
    expect(normalizeBends([{ index: 6, turn: 90 }], 6)).toEqual([]);
    expect(normalizeBends([{ index: -1, turn: 90 }], 6)).toEqual([]);
    expect(normalizeBends([{ index: 1.5, turn: 90 }], 6)).toEqual([]);
  });

  it('keeps the last turn when an index is repeated', () => {
    expect(
      normalizeBends(
        [
          { index: 2, turn: 90 },
          { index: 2, turn: -90 },
        ],
        6
      )
    ).toEqual([{ index: 2, turn: -90 }]);
  });

  it('sorts surviving bends by ascending index', () => {
    expect(
      normalizeBends(
        [
          { index: 4, turn: 90 },
          { index: 1, turn: -90 },
        ],
        6
      )
    ).toEqual([
      { index: 1, turn: -90 },
      { index: 4, turn: 90 },
    ]);
  });
});
