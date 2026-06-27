import {
  GenericHeuristic,
  SkillProfile,
  argmaxIndex,
  chooseActionIndex,
  createPolicyPlayer,
  scoreWithHeuristics,
  softmaxIndex,
} from './policy';

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const constant = (value: number): (() => number) => () => value;

interface Ctx {
  bonus: number;
}

const profile = (over: Partial<SkillProfile> = {}): SkillProfile => ({
  id: 'test',
  temperature: 0,
  blunderRate: 0,
  lookaheadDepth: 0,
  weights: {},
  enabled: new Set<string>(),
  ...over,
});

describe('scoreWithHeuristics', () => {
  it('sums only enabled heuristics, applying weights', () => {
    const a: GenericHeuristic<number, Ctx> = { id: 'a', score: (n) => n };
    const b: GenericHeuristic<number, Ctx> = { id: 'b', score: (_n, ctx) => ctx.bonus };
    const byId = new Map([
      ['a', a],
      ['b', b],
    ]);

    const skill = profile({
      enabled: new Set(['a']),
      weights: { a: 2 },
    });
    expect(scoreWithHeuristics(5, { bonus: 100 }, byId, skill)).toBe(10);

    const both = profile({
      enabled: new Set(['a', 'b']),
      weights: { a: 2, b: 0.5 },
    });
    expect(scoreWithHeuristics(5, { bonus: 100 }, byId, both)).toBe(10 + 50);
  });

  it('defaults missing weights to 1 and ignores unknown ids', () => {
    const a: GenericHeuristic<number, Ctx> = { id: 'a', score: (n) => n };
    const byId = new Map([['a', a]]);
    const skill = profile({ enabled: new Set(['a', 'missing']) });
    expect(scoreWithHeuristics(7, { bonus: 0 }, byId, skill)).toBe(7);
  });
});

describe('selection', () => {
  it('argmaxIndex returns the highest score', () => {
    expect(argmaxIndex([1, 9, 4], constant(0))).toBe(1);
  });

  it('argmaxIndex breaks ties using the rng', () => {
    expect(argmaxIndex([5, 5], constant(0))).toBe(0);
    expect(argmaxIndex([5, 5], constant(0.99))).toBe(1);
  });

  it('softmaxIndex concentrates on the best as temperature shrinks', () => {
    let best = 0;
    const rng = seeded(99);
    for (let i = 0; i < 500; i++) {
      if (softmaxIndex([0, 10], 0.1, rng) === 1) best++;
    }
    expect(best).toBeGreaterThan(490);
  });

  it('softmaxIndex spreads out as temperature grows', () => {
    let one = 0;
    const rng = seeded(99);
    for (let i = 0; i < 1000; i++) {
      if (softmaxIndex([0, 1], 1000, rng) === 1) one++;
    }
    expect(one).toBeGreaterThan(400);
    expect(one).toBeLessThan(600);
  });

  it('chooseActionIndex uses argmax at temperature 0', () => {
    expect(chooseActionIndex([3, 1, 2], profile({ temperature: 0 }), constant(0))).toBe(0);
  });
});

describe('createPolicyPlayer', () => {
  const number: GenericHeuristic<number, Ctx> = { id: 'n', score: (n) => n };

  function build(skill: SkillProfile, candidates: number[], rng = seeded(1)) {
    return createPolicyPlayer<unknown, number, Ctx>({
      skill,
      heuristics: [number],
      generateCandidates: () => candidates,
      buildContext: () => ({ bonus: 0 }),
      fallback: () => -1,
      rng,
    });
  }

  it('returns the fallback when there are no candidates', () => {
    const player = build(profile({ enabled: new Set(['n']) }), []);
    expect(player.decide(null)).toBe(-1);
  });

  it('returns the only candidate without scoring', () => {
    const player = build(profile({ enabled: new Set(['n']) }), [42]);
    expect(player.decide(null)).toBe(42);
  });

  it('greedily picks the best-scoring candidate', () => {
    const player = build(
      profile({ enabled: new Set(['n']), temperature: 0 }),
      [1, 8, 3]
    );
    expect(player.decide(null)).toBe(8);
  });

  it('blunders into a uniformly random candidate at blunderRate 1', () => {
    // rng() < 1 always true → blunder branch; floor(rng()*len) selects index.
    const player = build(
      profile({ enabled: new Set(['n']), blunderRate: 1 }),
      [10, 20, 30],
      constant(0.5)
    );
    expect(player.decide(null)).toBe(20);
  });

  it('is deterministic for a fixed seed', () => {
    const decisions = (): number[] => {
      const player = build(
        profile({ enabled: new Set(['n']), temperature: 1.5 }),
        [1, 2, 3, 4],
        seeded(2024)
      );
      return Array.from({ length: 10 }, () => player.decide(null));
    };
    expect(decisions()).toEqual(decisions());
  });
});
