import { DominoValue } from '@/game/DominoValue';
import { TrainData } from '@/game/TrainData';
import { dominoKey } from '@/rules/dominoSet';
import { resolveRules } from '@/rules/rulesConfig';
import { playMove } from '@/rules/placement';

import {
  collectAllPlayedKeys,
  createCandidateGenerator,
  defaultCandidateGenerator,
  generatePlayActions,
  getAccessibleTrainIndices,
} from './candidate-generator';
import { isPlayAction } from './types';
import type { AiObservation } from './types';

const rules = resolveRules();

function train(
  playerId: number,
  dominoes: DominoValue[],
  isPublic = false
): TrainData {
  return { playerId, isPublic, dominoes };
}

function makeObs(overrides: Partial<AiObservation> = {}): AiObservation {
  return {
    selfPlayerId: 0,
    hand: [],
    rules,
    engineValue: 12,
    trains: [train(0, [{ value1: 12, value2: 5 }])],
    ...overrides,
  };
}

describe('getAccessibleTrainIndices', () => {
  it('includes the bot’s own train and any public trains', () => {
    const obs = makeObs({
      trains: [
        train(0, [{ value1: 12, value2: 5 }]),
        train(1, [{ value1: 12, value2: 8 }], false),
        train(2, [{ value1: 12, value2: 3 }], true),
      ],
    });

    expect(getAccessibleTrainIndices(obs)).toEqual([0, 2]);
  });
});

describe('collectAllPlayedKeys', () => {
  it('merges played keys from every train', () => {
    const tileA = { value1: 12, value2: 5 };
    const tileB = { value1: 5, value2: 8 };
    const keys = collectAllPlayedKeys([
      train(0, [tileA]),
      train(1, [tileB]),
    ]);

    expect(keys.size).toBe(2);
    expect(keys.has(dominoKey(tileA))).toBe(true);
    expect(keys.has(dominoKey(tileB))).toBe(true);
  });
});

describe('generatePlayActions', () => {
  it('returns only engine-legal placements on accessible trains', () => {
    const obs = makeObs({
      hand: [
        { value1: 5, value2: 3 },
        { value1: 5, value2: 9 },
        { value1: 1, value2: 2 },
      ],
    });

    const actions = generatePlayActions(obs);
    expect(actions.length).toBeGreaterThan(0);

    for (const action of actions) {
      expect(isPlayAction(action)).toBe(true);
      const board = obs.trains[action.trainIndex];
      const result = playMove(board, action.move, obs.rules);
      expect(result.ok).toBe(true);
    }
  });

  it('excludes private opponent trains', () => {
    const obs = makeObs({
      hand: [{ value1: 8, value2: 3 }],
      trains: [
        train(0, [{ value1: 12, value2: 5 }]),
        train(1, [{ value1: 12, value2: 8 }], false),
      ],
    });

    expect(generatePlayActions(obs)).toHaveLength(0);
  });
});

describe('defaultCandidateGenerator', () => {
  it('offers every legal play when tiles match', () => {
    const obs = makeObs({
      hand: [
        { value1: 5, value2: 3 },
        { value1: 5, value2: 9 },
      ],
    });

    const actions = defaultCandidateGenerator(obs);
    expect(actions.every((action) => action.kind === 'play')).toBe(true);
    expect(actions.length).toBeGreaterThan(0);
  });

  it('draws when stuck and the pile has tiles', () => {
    const obs = makeObs({
      hand: [
        { value1: 1, value2: 2 },
        { value1: 3, value2: 4 },
      ],
      drawPileSize: 10,
    });

    expect(defaultCandidateGenerator(obs)).toEqual([{ kind: 'draw' }]);
  });

  it('passes when stuck and the pile is empty', () => {
    const obs = makeObs({
      hand: [{ value1: 1, value2: 2 }],
      drawPileSize: 0,
    });

    expect(defaultCandidateGenerator(obs)).toEqual([{ kind: 'pass' }]);
  });

  it('passes after the single draw for the turn is already used', () => {
    const obs = makeObs({
      hand: [{ value1: 1, value2: 2 }],
      drawPileSize: 10,
      turnDrawUsed: true,
    });

    expect(defaultCandidateGenerator(obs)).toEqual([{ kind: 'pass' }]);
  });
});

describe('createCandidateGenerator', () => {
  it('can offer draw even when legal plays exist', () => {
    const generator = createCandidateGenerator({ allowOptionalDraw: true });
    const obs = makeObs({
      hand: [
        { value1: 5, value2: 3 },
        { value1: 5, value2: 9 },
      ],
      drawPileSize: 5,
    });

    const actions = generator(obs);
    expect(actions.some((action) => action.kind === 'play')).toBe(true);
    expect(actions.some((action) => action.kind === 'draw')).toBe(true);
  });
});
