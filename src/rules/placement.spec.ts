import { TrainBranch } from '@/game/TrainData';
import { resolveRules } from '@/rules/rulesConfig';
import {
  applyMove,
  collectPlayedKeys,
  evaluatePlacement,
  getLegalMoves,
  getOpenEnds,
  getUnsatisfiedDoubles,
  playMove,
  OpenEnd,
} from '@/rules/placement';

const dbl = (v: number) => ({ value1: v, value2: v });

describe('placement: open ends', () => {
  it('offers the engine value for an empty train', () => {
    const ends = getOpenEnds({ dominoes: [] }, 12, resolveRules());
    expect(ends).toHaveLength(1);
    expect(ends[0]).toMatchObject({ value: 12, attach: 'run-tail' });
  });

  it('offers the growing tip with no obligation', () => {
    const board: TrainBranch = {
      dominoes: [
        { value1: 12, value2: 6 },
        { value1: 6, value2: 3 },
      ],
    };
    const ends = getOpenEnds(board, 12, resolveRules({ doubleObligation: 'none' }));
    expect(ends).toHaveLength(1);
    expect(ends[0].value).toBe(3);
  });
});

describe('placement: per-move legality', () => {
  const config = resolveRules();
  const end: OpenEnd = {
    path: [],
    attach: 'run-tail',
    value: 6,
    attachToDouble: false,
    obligation: false,
  };

  it('accepts a matching, unused, non-double tile', () => {
    const result = evaluatePlacement({ value1: 6, value2: 2 }, end, new Set(), config);
    expect(result.legal).toBe(true);
  });

  it('rejects a tile that does not match the open value', () => {
    const result = evaluatePlacement({ value1: 5, value2: 2 }, end, new Set(), config);
    expect(result.violations).toContain('value-mismatch');
  });

  it('rejects a duplicate tile', () => {
    const played = new Set(['2:6']);
    const result = evaluatePlacement({ value1: 6, value2: 2 }, end, played, config);
    expect(result.violations).toContain('duplicate-tile');
  });

  it('rejects a double played onto a double', () => {
    const doubleEnd: OpenEnd = { ...end, value: 6, attachToDouble: true };
    const result = evaluatePlacement(dbl(6), doubleEnd, new Set(), config);
    expect(result.violations).toContain('consecutive-doubles');
  });

  it('allows consecutive doubles when configured', () => {
    const relaxed = resolveRules({ allowConsecutiveDoubles: true });
    const doubleEnd: OpenEnd = { ...end, attachToDouble: true };
    const result = evaluatePlacement(dbl(6), doubleEnd, new Set(), relaxed);
    expect(result.violations).not.toContain('consecutive-doubles');
  });
});

describe('placement: cover obligation', () => {
  const config = resolveRules({ doubleObligation: 'cover' });

  it('forces a cover on an unanswered tail double', () => {
    const board: TrainBranch = {
      dominoes: [{ value1: 12, value2: 6 }, dbl(6)],
    };
    expect(getUnsatisfiedDoubles(board, config)).toHaveLength(1);

    const ends = getOpenEnds(board, 12, config);
    expect(ends).toHaveLength(1);
    expect(ends[0]).toMatchObject({ value: 6, attach: 'run-tail' });

    const covered = applyMove(board, {
      end: ends[0],
      tile: { value1: 6, value2: 3 },
    });
    expect(getUnsatisfiedDoubles(covered, config)).toHaveLength(0);
    expect(getOpenEnds(covered, 12, config)[0].value).toBe(3);
  });
});

describe('placement: chicken-foot obligation', () => {
  const config = resolveRules({ doubleObligation: 'chicken-foot' });

  it('requires a full foot (center + two side toes) before resuming play', () => {
    let board: TrainBranch = {
      dominoes: [{ value1: 12, value2: 6 }, dbl(6)],
    };

    // 1) center continuation + one side toe both offered initially.
    let ends = getOpenEnds(board, 12, config);
    expect(ends.map((e) => e.attach).sort()).toEqual(['run-tail', 'side-toe']);

    // center
    board = applyMove(board, {
      end: ends.find((e) => e.attach === 'run-tail')!,
      tile: { value1: 6, value2: 3 },
    });
    expect(getUnsatisfiedDoubles(board, config)).toHaveLength(1);

    // first side toe
    ends = getOpenEnds(board, 12, config);
    expect(ends).toHaveLength(1);
    expect(ends[0].attach).toBe('side-toe');
    board = applyMove(board, { end: ends[0], tile: { value1: 6, value2: 2 } });

    // second side toe completes the foot
    ends = getOpenEnds(board, 12, config);
    expect(ends[0]).toMatchObject({ attach: 'side-toe', toeSlot: 1 });
    board = applyMove(board, { end: ends[0], tile: { value1: 6, value2: 4 } });

    expect(getUnsatisfiedDoubles(board, config)).toHaveLength(0);

    // 2) now all three tips are open (main 3, toe 2, toe 4).
    const tips = getOpenEnds(board, 12, config)
      .map((e) => e.value)
      .sort();
    expect(tips).toEqual([2, 3, 4]);
  });
});

describe('placement: apply + play', () => {
  it('does not mutate the input board', () => {
    const board: TrainBranch = { dominoes: [{ value1: 12, value2: 6 }] };
    const next = applyMove(board, {
      end: getOpenEnds(board, 12, resolveRules())[0],
      tile: { value1: 6, value2: 2 },
    });
    expect(board.dominoes).toHaveLength(1);
    expect(next.dominoes).toHaveLength(2);
  });

  it('playMove rejects illegal and applies legal moves', () => {
    const config = resolveRules();
    const board: TrainBranch = { dominoes: [{ value1: 12, value2: 6 }] };
    const end = getOpenEnds(board, 12, config)[0];

    const bad = playMove(board, { end, tile: { value1: 5, value2: 5 } }, config);
    expect(bad.ok).toBe(false);
    expect(bad.board).toBe(board);

    const good = playMove(board, { end, tile: { value1: 6, value2: 2 } }, config);
    expect(good.ok).toBe(true);
    expect(good.board.dominoes).toHaveLength(2);
  });

  it('filters a hand to legal moves and tracks played keys', () => {
    const config = resolveRules({ doubleObligation: 'none' });
    const board: TrainBranch = {
      dominoes: [
        { value1: 12, value2: 6 },
        { value1: 6, value2: 3 },
      ],
    };
    const hand = [
      { value1: 3, value2: 9 }, // legal (matches tip 3)
      { value1: 6, value2: 3 }, // duplicate
      { value1: 5, value2: 1 }, // mismatch
    ];
    const moves = getLegalMoves(
      board,
      12,
      hand,
      collectPlayedKeys(board),
      config
    );
    expect(moves).toHaveLength(1);
    expect(moves[0].tile).toEqual({ value1: 3, value2: 9 });
  });
});
