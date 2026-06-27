import { TrainBranch } from '@/game/TrainData';
import { validateChickenFootChain } from '@/harness/layoutValidation';
import { dominoKey, generateDominoSet } from '@/rules/dominoSet';
import {
  collectPlayedKeys,
  getLegalMoves,
  playMove,
} from '@/rules/placement';
import { resolveRules, RulesConfig } from '@/rules/rulesConfig';

/** Deterministic PRNG so fuzz failures are reproducible from the seed. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function playRandomGame(config: RulesConfig, seed: number, handSize: number): void {
  const rand = mulberry32(seed);
  const engineValue = config.engineValue;
  const engineKey = dominoKey({ value1: engineValue, value2: engineValue });

  const pool = generateDominoSet(config.maxPips).filter(
    (tile) => dominoKey(tile) !== engineKey
  );
  const hand = shuffle(pool, rand).slice(0, handSize);

  let board: TrainBranch = { dominoes: [] };

  for (let step = 0; step < handSize; step++) {
    const moves = getLegalMoves(
      board,
      engineValue,
      hand,
      collectPlayedKeys(board),
      config
    );
    if (moves.length === 0) break;

    const move = moves[Math.floor(rand() * moves.length)];
    const result = playMove(board, move, config);

    expect(result.ok, `[${config.doubleObligation} seed=${seed} step=${step}]`).toBe(
      true
    );
    board = result.board;

    expect(
      validateChickenFootChain(board).issues,
      `[${config.doubleObligation} seed=${seed} step=${step}]`
    ).toEqual([]);

    const played = collectPlayedKeys(board);
    expect(played.size, `[${config.doubleObligation} seed=${seed} step=${step}]`).toBe(
      step + 1
    );

    const key = dominoKey(move.tile);
    const idx = hand.findIndex((tile) => dominoKey(tile) === key);
    expect(idx, `[${config.doubleObligation} seed=${seed} step=${step}]`).toBeGreaterThanOrEqual(
      0
    );
    hand.splice(idx, 1);
  }
}

describe('placement fuzz', () => {
  const configs = [
    resolveRules({ doubleObligation: 'none' }),
    resolveRules({ doubleObligation: 'cover' }),
    resolveRules({ doubleObligation: 'chicken-foot' }),
  ] as const;

  for (const config of configs) {
    it(`keeps the board valid through random play (${config.doubleObligation})`, () => {
      for (let run = 0; run < 30; run++) {
        const seed = run * 997 + config.doubleObligation.length * 131;
        const handSize = 8 + (run % 10);
        playRandomGame(config, seed, handSize);
      }
    });
  }
});
