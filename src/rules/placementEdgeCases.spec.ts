import { TrainBranch } from '@/game/TrainData';
import { resolveRules } from '@/rules/rulesConfig';
import {
  OpenEnd,
  applyMove,
  collectPlayedKeys,
  evaluatePlacement,
  getBranchAt,
  getLegalMoves,
  getOpenEnds,
  getUnsatisfiedDoubles,
} from '@/rules/placement';

const dbl = (v: number) => ({ value1: v, value2: v });

describe('placement: relaxed rule flags', () => {
  const end: OpenEnd = {
    path: [],
    attach: 'run-tail',
    value: 6,
    attachToDouble: false,
    obligation: false,
  };

  it('allows a mismatched tile when sequencing is not required', () => {
    const config = resolveRules({ requireSequential: false });
    const result = evaluatePlacement({ value1: 5, value2: 1 }, end, new Set(), config);
    expect(result.violations).not.toContain('value-mismatch');
    expect(result.legal).toBe(true);
  });

  it('allows a duplicate tile when uniqueness is not required', () => {
    const config = resolveRules({ requireUniqueTiles: false });
    const played = new Set(['2:6']);
    const result = evaluatePlacement({ value1: 6, value2: 2 }, end, played, config);
    expect(result.violations).not.toContain('duplicate-tile');
  });

  it('reports every violation at once', () => {
    const config = resolveRules();
    const doubleEnd: OpenEnd = { ...end, value: 6, attachToDouble: true };
    // wrong value AND a duplicate AND a double-on-double.
    const result = evaluatePlacement(dbl(5), doubleEnd, new Set(['5:5']), config);
    expect(result.violations.sort()).toEqual(
      ['consecutive-doubles', 'duplicate-tile', 'value-mismatch'].sort()
    );
  });
});

describe('placement: a blocked train offers no moves', () => {
  it('returns no legal moves when nothing in hand matches', () => {
    const config = resolveRules({ doubleObligation: 'none' });
    const board: TrainBranch = {
      dominoes: [
        { value1: 12, value2: 6 },
        { value1: 6, value2: 3 },
      ],
    };
    const hand = [
      { value1: 5, value2: 1 },
      { value1: 9, value2: 8 },
    ];
    const moves = getLegalMoves(board, 12, hand, collectPlayedKeys(board), config);
    expect(moves).toEqual([]);
  });
});

describe('placement: nested doubles', () => {
  const config = resolveRules({ doubleObligation: 'cover' });

  const board: TrainBranch = {
    dominoes: [
      { value1: 12, value2: 6 },
      dbl(6), // answered by the center continuation below
      { value1: 6, value2: 3 },
    ],
    feet: {
      1: [
        {
          // a side toe that ends on its own unanswered double
          dominoes: [
            { value1: 6, value2: 4 },
            dbl(4),
          ],
        },
      ],
    },
  };

  it('finds an unsatisfied double nested inside a side toe', () => {
    const unsatisfied = getUnsatisfiedDoubles(board, config);
    expect(unsatisfied).toHaveLength(1);
    expect(unsatisfied[0].value).toBe(4);
    expect(unsatisfied[0].path).toEqual([{ doubleIndex: 1, toeIndex: 0 }]);
  });

  it('collects played keys across every nested branch', () => {
    const keys = collectPlayedKeys(board);
    expect(keys.has('6:12')).toBe(true); // main run
    expect(keys.has('4:6')).toBe(true); // inside the toe
    expect(keys.has('4:4')).toBe(true); // the nested double
  });
});

describe('placement: getBranchAt', () => {
  const board: TrainBranch = {
    dominoes: [dbl(6)],
    feet: { 0: [{ dominoes: [{ value1: 6, value2: 2 }] }] },
  };

  it('returns the root for an empty path', () => {
    expect(getBranchAt(board, [])).toBe(board);
  });

  it('descends into a named toe', () => {
    expect(getBranchAt(board, [{ doubleIndex: 0, toeIndex: 0 }])?.dominoes[0]).toEqual({
      value1: 6,
      value2: 2,
    });
  });

  it('returns undefined for a path that does not exist', () => {
    expect(getBranchAt(board, [{ doubleIndex: 3, toeIndex: 9 }])).toBeUndefined();
  });
});

describe('placement: applyMove for side toes', () => {
  const config = resolveRules({ doubleObligation: 'chicken-foot' });

  it('writes a side toe into the right double index and slot, oriented to connect', () => {
    const board: TrainBranch = { dominoes: [{ value1: 12, value2: 6 }, dbl(6)] };
    const sideEnd = getOpenEnds(board, 12, config).find(
      (e) => e.attach === 'side-toe'
    )!;
    expect(sideEnd).toBeDefined();

    // tile given "backwards" must be oriented so the connecting end is value1.
    const next = applyMove(board, { end: sideEnd, tile: { value1: 2, value2: 6 } });
    const toe = next.feet?.[1]?.[0];
    expect(toe?.dominoes[0]).toEqual({ value1: 6, value2: 2 });
  });

  it('does not mutate the original board (deep)', () => {
    const board: TrainBranch = {
      dominoes: [{ value1: 12, value2: 6 }, dbl(6)],
      feet: { 1: [{ dominoes: [{ value1: 6, value2: 2 }] }] },
    };
    const sideEnd: OpenEnd = {
      path: [],
      attach: 'side-toe',
      value: 6,
      doubleIndex: 1,
      toeSlot: 1,
      attachToDouble: true,
      obligation: true,
    };
    const next = applyMove(board, { end: sideEnd, tile: { value1: 6, value2: 4 } });

    // original keeps a single toe; result has two.
    expect(board.feet?.[1]).toHaveLength(1);
    expect(next.feet?.[1]).toHaveLength(2);
    expect(next.feet?.[1]?.[1]?.dominoes[0]).toEqual({ value1: 6, value2: 4 });
  });
});
