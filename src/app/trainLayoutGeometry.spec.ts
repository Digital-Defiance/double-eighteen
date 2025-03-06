import {
  DOMINO_HEIGHT,
  DOMINO_WIDTH,
  TrainLayoutEntry,
  computeTrainLayout,
  getTrainLayoutBounds,
  stepAlongTrain,
  tileCorners,
  tilesOverlap,
  trainPerpendicular,
} from './trainLayout';
import { TRAIN_FIXTURES } from '@/harness/trainFixtures';

const tile = (over: Partial<TrainLayoutEntry> = {}): TrainLayoutEntry => ({
  x: 0,
  y: 0,
  rotation: 0,
  isDouble: false,
  value1: 1,
  value2: 2,
  ...over,
});

describe('tileCorners', () => {
  it('returns the rectangle corners for an unrotated tile', () => {
    const corners = tileCorners(tile({ x: 100, y: 200 }));
    const xs = corners.map((c) => c.x).sort((a, b) => a - b);
    const ys = corners.map((c) => c.y).sort((a, b) => a - b);
    expect(xs[0]).toBeCloseTo(100 - DOMINO_WIDTH / 2, 5);
    expect(xs[3]).toBeCloseTo(100 + DOMINO_WIDTH / 2, 5);
    expect(ys[0]).toBeCloseTo(200 - DOMINO_HEIGHT / 2, 5);
    expect(ys[3]).toBeCloseTo(200 + DOMINO_HEIGHT / 2, 5);
  });

  it('rotates corners 90° (width and height swap extents)', () => {
    const corners = tileCorners(tile({ x: 0, y: 0, rotation: 90 }));
    const xs = corners.map((c) => c.x).sort((a, b) => a - b);
    const ys = corners.map((c) => c.y).sort((a, b) => a - b);
    expect(xs[3] - xs[0]).toBeCloseTo(DOMINO_HEIGHT, 5);
    expect(ys[3] - ys[0]).toBeCloseTo(DOMINO_WIDTH, 5);
  });
});

describe('tilesOverlap', () => {
  it('detects two tiles at the same spot as overlapping', () => {
    expect(tilesOverlap(tile(), tile())).toBe(true);
  });

  it('treats far-apart tiles as not overlapping', () => {
    expect(tilesOverlap(tile({ x: 0 }), tile({ x: 1000 }))).toBe(false);
  });

  it('treats edge-to-edge neighbours as not overlapping', () => {
    // Two unrotated tiles a full width apart touch along an edge but do not overlap.
    expect(tilesOverlap(tile({ x: 0 }), tile({ x: DOMINO_WIDTH }))).toBe(false);
  });

  it('detects partial overlap of rotated tiles', () => {
    expect(tilesOverlap(tile({ rotation: 0 }), tile({ x: 20, rotation: 90 }))).toBe(
      true
    );
  });
});

describe('getTrainLayoutBounds', () => {
  it('returns a padded box for an empty layout', () => {
    const bounds = getTrainLayoutBounds([]);
    expect(bounds.width).toBeGreaterThan(0);
    expect(bounds.height).toBeGreaterThan(0);
  });

  it('grows to enclose every tile and offsets into positive space', () => {
    const layout = [tile({ x: 0, y: 0 }), tile({ x: 300, y: 150 })];
    const bounds = getTrainLayoutBounds(layout);
    expect(bounds.width).toBeGreaterThan(300);
    expect(bounds.height).toBeGreaterThan(150);
    // The leftmost tile, shifted by the offset, lands inside the box.
    expect(bounds.offsetX).toBeGreaterThan(0);
    expect(bounds.offsetY).toBeGreaterThan(0);
  });
});

describe('computeTrainLayout: linear', () => {
  const dominoes = [
    { value1: 12, value2: 6 },
    { value1: 6, value2: 6 },
    { value1: 6, value2: 3 },
  ];

  it('keeps every tile on the train centerline (no perpendicular offset)', () => {
    const layout = computeTrainLayout({
      startX: 0,
      startY: 0,
      angle: 0,
      dominoes,
      layoutStyle: 'linear',
    });
    expect(layout).toHaveLength(3);
    // angle 0 → perpendicular is the y axis; all tiles share the same y.
    expect(new Set(layout.map((e) => Math.round(e.y)))).toEqual(new Set([0]));
  });

  it('rotates doubles across the train and regulars along it', () => {
    const layout = computeTrainLayout({
      startX: 0,
      startY: 0,
      angle: 0,
      dominoes,
      layoutStyle: 'linear',
    });
    expect(layout[1].isDouble).toBe(true);
    expect(((layout[1].rotation % 360) + 360) % 360).toBe(180);
    expect(((layout[0].rotation % 360) + 360) % 360).toBe(270);
  });

  it('spaces consecutive tiles by stepAlongTrain', () => {
    const layout = computeTrainLayout({
      startX: 0,
      startY: 0,
      angle: 0,
      dominoes,
      layoutStyle: 'linear',
    });
    const d01 = Math.hypot(layout[1].x - layout[0].x, layout[1].y - layout[0].y);
    expect(d01).toBeCloseTo(stepAlongTrain(false, true), 5);
    const d12 = Math.hypot(layout[2].x - layout[1].x, layout[2].y - layout[1].y);
    expect(d12).toBeCloseTo(stepAlongTrain(true, false), 5);
  });
});

describe('computeTrainLayout: offset', () => {
  const perpOf = (entry: TrainLayoutEntry, angle: number) => {
    const { perpX, perpY } = trainPerpendicular(angle);
    return entry.x * perpX + entry.y * perpY;
  };

  it('keeps the offset run within two perpendicular rows', () => {
    for (const fixture of TRAIN_FIXTURES.filter((f) =>
      f.layoutStyles.includes('offset')
    )) {
      const layout = computeTrainLayout({
        startX: 0,
        startY: 0,
        angle: fixture.angle,
        dominoes: fixture.dominoes,
        layoutStyle: 'offset',
      });
      const lanes = new Set(
        layout.map((e) => Math.round(perpOf(e, fixture.angle) / (DOMINO_WIDTH / 2)))
      );
      expect(lanes.size).toBeLessThanOrEqual(2);
    }
  });

  it('centers the tiles entering and leaving a double in the double lane', () => {
    // double-after-regular: tiles at index 1 (in), 2 (double), 3 (out) share a lane.
    const fixture = TRAIN_FIXTURES.find((f) => f.id === 'double-after-regular')!;
    const layout = computeTrainLayout({
      startX: 0,
      startY: 0,
      angle: fixture.angle,
      dominoes: fixture.dominoes,
      layoutStyle: 'offset',
    });
    expect(layout[2].isDouble).toBe(true);
    const inLane = perpOf(layout[1], fixture.angle);
    const doubleLane = perpOf(layout[2], fixture.angle);
    const outLane = perpOf(layout[3], fixture.angle);
    expect(Math.abs(inLane - doubleLane)).toBeLessThan(1);
    expect(Math.abs(outLane - doubleLane)).toBeLessThan(1);
  });
});

describe('computeTrainLayout: global no-overlap (SAT)', () => {
  it.each(
    TRAIN_FIXTURES.flatMap((fixture) =>
      fixture.layoutStyles.map(
        (layoutStyle) => [fixture.id, layoutStyle, fixture] as const
      )
    )
  )('no two tiles overlap in fixture %s (%s)', (_id, layoutStyle, fixture) => {
    const layout = computeTrainLayout({
      startX: 50,
      startY: 50,
      angle: fixture.angle,
      dominoes: fixture.dominoes,
      layoutStyle,
    });
    for (let i = 0; i < layout.length; i++) {
      for (let j = i + 1; j < layout.length; j++) {
        expect(tilesOverlap(layout[i], layout[j])).toBe(false);
      }
    }
  });
});
