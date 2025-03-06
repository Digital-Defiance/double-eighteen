import {
  CHICKEN_FOOT_TOE_ANGLES,
  DOMINO_HEIGHT,
  DOMINO_WIDTH,
  computeTrainTree,
  flattenSegments,
  trainDirection,
  trainPerpendicular,
} from '@/app/trainLayout';
import {
  validateChickenFootChain,
  validateTrainTree,
} from '@/harness/layoutValidation';
import { CHICKEN_FOOT_FIXTURES } from '@/harness/trainFixtures';

const START_X = 200;
const START_Y = 200;

describe('computeTrainTree (chicken foot)', () => {
  it.each(
    CHICKEN_FOOT_FIXTURES.flatMap((fixture) =>
      fixture.layoutStyles.map(
        (layoutStyle) => [fixture.id, layoutStyle, fixture] as const
      )
    )
  )('fixture %s passes tree validation in %s layout', (_id, layoutStyle, fixture) => {
    const segments = computeTrainTree({
      startX: START_X,
      startY: START_Y,
      angle: fixture.angle,
      branch: fixture.branch,
      layoutStyle,
    });

    const chain = validateChickenFootChain(fixture.branch);
    expect(chain.issues).toEqual([]);

    const geometry = validateTrainTree(segments);
    expect(geometry.issues).toEqual([]);
  });

  it('emits one segment per branch (main + each side toe), recursively', () => {
    const fixture = CHICKEN_FOOT_FIXTURES.find((f) => f.id === 'nested-foot');
    expect(fixture).toBeDefined();

    const segments = computeTrainTree({
      startX: START_X,
      startY: START_Y,
      angle: fixture!.angle,
      branch: fixture!.branch,
      layoutStyle: 'linear',
    });

    // main + 2 toes off the first double + 2 nested toes off the toe's double
    expect(segments).toHaveLength(5);
    expect(segments.filter((s) => s.depth === 0)).toHaveLength(1);
    expect(segments.filter((s) => s.depth === 1)).toHaveLength(2);
    expect(segments.filter((s) => s.depth === 2)).toHaveLength(2);
  });

  it('fans side toes at -45 and +45 relative to the host direction', () => {
    const segments = computeTrainTree({
      startX: START_X,
      startY: START_Y,
      angle: 0,
      branch: CHICKEN_FOOT_FIXTURES[0].branch,
      layoutStyle: 'linear',
    });

    const toes = segments.filter((s) => s.depth === 1);
    expect(toes.map((t) => t.angle).sort((a, b) => a - b)).toEqual([
      CHICKEN_FOOT_TOE_ANGLES[0],
      CHICKEN_FOOT_TOE_ANGLES[1],
    ]);
  });

  it('starts each toe half a domino-height out from its host double', () => {
    const segments = computeTrainTree({
      startX: START_X,
      startY: START_Y,
      angle: 0,
      branch: CHICKEN_FOOT_FIXTURES[0].branch,
      layoutStyle: 'linear',
    });

    for (const toe of segments.filter((s) => s.anchor && s.layout.length)) {
      const first = toe.layout[0];
      const { dirX, dirY } = trainDirection(toe.angle);
      const along =
        (first.x - toe.anchor!.x) * dirX + (first.y - toe.anchor!.y) * dirY;
      expect(along).toBeCloseTo(DOMINO_HEIGHT / 2, 5);
    }
  });

  it('flattens to exactly the total number of tiles', () => {
    const fixture = CHICKEN_FOOT_FIXTURES.find((f) => f.id === 'nested-foot')!;
    const segments = computeTrainTree({
      startX: START_X,
      startY: START_Y,
      angle: fixture.angle,
      branch: fixture.branch,
      layoutStyle: 'offset',
    });

    const countTiles = (branch = fixture.branch): number =>
      branch.dominoes.length +
      Object.values(branch.feet ?? {})
        .flat()
        .reduce((sum, toe) => sum + countTiles(toe), 0);

    expect(flattenSegments(segments)).toHaveLength(countTiles());
  });

  it('snugs each toe against the double open edge (sliding along it to clear)', () => {
    const segments = computeTrainTree({
      startX: START_X,
      startY: START_Y,
      angle: 0,
      branch: CHICKEN_FOOT_FIXTURES[0].branch,
      layoutStyle: 'offset',
    });

    const main = segments[0];
    const host = main.layout[1];
    expect(host.isDouble).toBe(true);

    // Snug-against-the-edge invariant: the along-train distance from the double
    // center to a toe's first tile is fixed at (open edge) + leadGap projected
    // onto the train. A blocked toe may still slide ALONG the edge (perp) to step
    // past the offset center toe, but it never pulls in off the edge.
    const expectedAlong =
      DOMINO_WIDTH / 2 + (DOMINO_HEIGHT / 2) * Math.cos(Math.PI / 4);

    for (const toe of segments.filter((s) => s.depth === 1)) {
      const first = toe.layout[0];
      const { dirX, dirY } = trainDirection(0);
      const along = (first.x - host.x) * dirX + (first.y - host.y) * dirY;
      expect(Math.abs(along - expectedAlong)).toBeLessThan(1);
      // Toes inherit the main-line style (offset here) and seed their zigzag on
      // the inner lane (opposite the toe's angle side) so the brick pair fans
      // outward, away from the center toe.
      expect(toe.layoutStyle).toBe('offset');
      expect(toe.outwardSign).toBe(-Math.sign(toe.angle));
    }
  });

  it('keeps an unobstructed toe exactly snug at the double open corner', () => {
    const segments = computeTrainTree({
      startX: START_X,
      startY: START_Y,
      angle: 0,
      branch: CHICKEN_FOOT_FIXTURES[0].branch,
      layoutStyle: 'offset',
    });
    const host = segments[0].layout[1];
    const { dirX, dirY } = trainDirection(0);
    const { perpX, perpY } = trainPerpendicular(0);

    // At least one toe is unobstructed and lands exactly on corner + toeDir*H/2.
    const snugHit = segments
      .filter((s) => s.depth === 1)
      .some((toe) => {
        const sideSign = Math.sign(toe.angle);
        const cornerX =
          host.x + dirX * (DOMINO_WIDTH / 2) + perpX * (DOMINO_HEIGHT / 2) * sideSign;
        const cornerY =
          host.y + dirY * (DOMINO_WIDTH / 2) + perpY * (DOMINO_HEIGHT / 2) * sideSign;
        const toeDir = trainDirection(toe.angle);
        const expectedX = cornerX + toeDir.dirX * (DOMINO_HEIGHT / 2);
        const expectedY = cornerY + toeDir.dirY * (DOMINO_HEIGHT / 2);
        const first = toe.layout[0];
        return (
          Math.abs(first.x - expectedX) < 1 && Math.abs(first.y - expectedY) < 1
        );
      });
    expect(snugHit).toBe(true);
  });
});
