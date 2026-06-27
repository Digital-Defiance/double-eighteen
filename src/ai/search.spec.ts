import { SearchModel, searchActionValues } from './search';

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function best<T>(scored: { action: T; value: number }[]): T {
  return scored.reduce((a, b) => (b.value > a.value ? b : a)).action;
}

/**
 * A tiny two-player tree where the greedy (depth-1) read is a trap: move "A"
 * lands on a position that *looks* great (eval 9) but the opponent can punish it
 * down to 0, while move "B" looks mediocre (eval 1) yet is worth 1 after the
 * opponent's best reply. Only looking ahead past the opponent reveals B > A.
 */
type Node = {
  player: 0 | 1;
  value: number;
  actions: Record<string, string>;
};

const TREE: Record<string, Node> = {
  root: { player: 0, value: 0, actions: { A: 'nA', B: 'nB' } },
  nA: { player: 1, value: 9, actions: { a1: 'lA0', a2: 'lA10' } },
  nB: { player: 1, value: 1, actions: { b1: 'lB1', b2: 'lB2' } },
  lA0: { player: 0, value: 0, actions: {} },
  lA10: { player: 0, value: 10, actions: {} },
  lB1: { player: 0, value: 1, actions: {} },
  lB2: { player: 0, value: 2, actions: {} },
};

const treeModel: SearchModel<string, string> = {
  legalActions: (s) => Object.keys(TREE[s].actions),
  applyAction: (s, a) => TREE[s].actions[a],
  isTerminal: (s) => Object.keys(TREE[s].actions).length === 0,
  currentPlayer: (s) => TREE[s].player,
  evaluate: (s) => TREE[s].value,
};

describe('searchActionValues — lookahead', () => {
  it('depth 1 is greedy and falls for the trap', () => {
    const scored = searchActionValues('root', treeModel, {
      depth: 1,
      perspective: 0,
    });
    expect(best(scored)).toBe('A');
    expect(scored.find((s) => s.action === 'A')!.value).toBe(9);
    expect(scored.find((s) => s.action === 'B')!.value).toBe(1);
  });

  it('depth 2 sees the opponent reply and avoids the trap', () => {
    const scored = searchActionValues('root', treeModel, {
      depth: 2,
      perspective: 0,
    });
    expect(best(scored)).toBe('B');
    // A is punished to its worst child (0), B to its worst child (1).
    expect(scored.find((s) => s.action === 'A')!.value).toBe(0);
    expect(scored.find((s) => s.action === 'B')!.value).toBe(1);
  });

  it('respects maxBranch by only expanding the first ordered actions', () => {
    const scored = searchActionValues('root', treeModel, {
      depth: 2,
      perspective: 0,
      maxBranch: 1,
      // Order so only "B" is considered at the root.
    });
    // Default order is insertion order (A, B); capping to 1 keeps only A.
    expect(scored).toHaveLength(1);
    expect(scored[0].action).toBe('A');
  });
});

describe('searchActionValues — determinization (imperfect information)', () => {
  // A single root action whose value depends on a hidden world the search must
  // sample rather than observe.
  interface World {
    revealed: number | null;
  }
  const model = (worldFor: (rng: () => number) => number): SearchModel<World, 'go'> => ({
    legalActions: () => ['go'],
    applyAction: (s) => s,
    isTerminal: (s) => s.revealed !== null,
    currentPlayer: () => 0,
    evaluate: (s) => s.revealed ?? 0,
    determinize: (_s, _p, rng) => ({ revealed: worldFor(rng) }),
  });

  it('uses the determinized world (constant world → its value)', () => {
    const scored = searchActionValues({ revealed: null }, model(() => 7), {
      depth: 1,
      perspective: 0,
      determinizations: 5,
    });
    expect(scored[0].value).toBe(7);
  });

  it('averages across sampled worlds', () => {
    // World is 0 or 10 depending on the coin; the average must land strictly
    // between the extremes given a fair-ish seeded sampler.
    const scored = searchActionValues(
      { revealed: null },
      model((rng) => (rng() < 0.5 ? 0 : 10)),
      { depth: 1, perspective: 0, determinizations: 400, rng: seeded(123) }
    );
    expect(scored[0].value).toBeGreaterThan(2);
    expect(scored[0].value).toBeLessThan(8);
  });
});
