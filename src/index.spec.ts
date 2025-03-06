import * as lib from './index';

describe('public API surface', () => {
  it('exports every advertised value binding (no broken barrel re-exports)', () => {
    const expected = [
      // components
      'DoubleTwelve',
      'MexicanTrainGame',
      'DominoHub',
      'DominoTrain',
      // pip color API
      'DEFAULT_PIP_COLORS',
      'PIP_COLORS',
      'mergePipColors',
      'resolvePipStyle',
      'getPipStyle',
      'PIP_LAYOUTS',
      'getPipLayout',
      'resolvePipPosition',
      // layout
      'computeTrainLayout',
      'computeTrainTree',
      'flattenSegments',
      'stepAlongTrain',
      'outwardPerpSign',
      'getTrainLayoutBounds',
      'tileCorners',
      'tilesOverlap',
      'CHICKEN_FOOT_TOE_ANGLES',
      // validation + fixtures
      'validateTrainLayout',
      'validateTrainTree',
      'validateChickenFootChain',
      'TRAIN_FIXTURES',
      'CHICKEN_FOOT_FIXTURES',
      // rules core
      'tileKey',
      'dominoKey',
      'isDouble',
      'tileHasValue',
      'otherEnd',
      'orientForConnection',
      'generateDominoSet',
      'dominoSetSize',
      'DEFAULT_RULES',
      'resolveRules',
      'requiredDoubleAnswers',
      'sideToeSlots',
      'getOpenEnds',
      'getUnsatisfiedDoubles',
      'getBranchAt',
      'collectPlayedKeys',
      'evaluatePlacement',
      'getLegalMoves',
      'applyMove',
      'playMove',
    ] as const;

    for (const name of expected) {
      expect(lib[name as keyof typeof lib], `missing export: ${name}`).toBeDefined();
    }
  });

  it('does not export any undefined named bindings', () => {
    for (const [name, value] of Object.entries(lib)) {
      expect(value, `export ${name} is undefined`).toBeDefined();
    }
  });
});

describe('end-to-end rules simulation via the public API', () => {
  it('plays a hand out, keeping the board legal at every step', () => {
    const config = lib.resolveRules({ doubleObligation: 'none' });
    let board = { dominoes: [] as { value1: number; value2: number }[] };
    const engineValue = 12;

    // A connectable hand: 12-6, 6-3, 3-3, 3-1.
    const hand = [
      { value1: 12, value2: 6 },
      { value1: 6, value2: 3 },
      { value1: 3, value2: 3 },
      { value1: 3, value2: 1 },
    ];
    const remaining = [...hand];

    let guard = 0;
    while (remaining.length > 0 && guard++ < 20) {
      const moves = lib.getLegalMoves(
        board,
        engineValue,
        remaining,
        lib.collectPlayedKeys(board),
        config
      );
      if (moves.length === 0) break;

      const move = moves[0];
      const result = lib.playMove(board, move, config);
      expect(result.ok).toBe(true);
      board = result.board;

      // remove the played tile from the hand (match by canonical key)
      const key = lib.dominoKey(move.tile);
      const idx = remaining.findIndex((t) => lib.dominoKey(t) === key);
      remaining.splice(idx, 1);

      // the board must remain a valid, well-formed chain throughout
      expect(lib.validateChickenFootChain(board).valid).toBe(true);
    }

    expect(remaining).toHaveLength(0);
    expect(board.dominoes).toHaveLength(hand.length);

    // every placed tile is unique
    const keys = lib.collectPlayedKeys(board);
    expect(keys.size).toBe(hand.length);
  });
});
