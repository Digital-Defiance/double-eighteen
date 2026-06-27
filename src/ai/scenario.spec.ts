import { dominoKey } from '@/rules/dominoSet';
import { playMove } from '@/rules/placement';

import { createAiPlayer } from './create-ai-player';
import {
  createCandidateGenerator,
  defaultCandidateGenerator,
  generatePlayActions,
} from './candidate-generator';
import { getSkillProfile } from './skill-profiles';
import { isPlayAction } from './types';
import { makeObs, mulberry32, train } from './test-fixtures';

describe('scenario — train access', () => {
  it('generates plays on an opponent train once it is public', () => {
    const obs = makeObs({
      selfPlayerId: 1,
      hand: [{ value1: 3, value2: 5 }],
      trains: [
        train(0, [{ value1: 12, value2: 5 }]),
        train(1, [{ value1: 12, value2: 8 }], false),
        train(2, [{ value1: 12, value2: 3 }], true),
      ],
    });

    const actions = generatePlayActions(obs);
    expect(actions).toHaveLength(1);
    expect(actions[0]?.trainIndex).toBe(2);

    const board = obs.trains[2];
    const result = playMove(board, actions[0]!.move, obs.rules);
    expect(result.ok).toBe(true);
  });

  it('blocks private opponent trains even when a tile would fit', () => {
    const obs = makeObs({
      selfPlayerId: 0,
      hand: [{ value1: 8, value2: 3 }],
      trains: [
        train(0, [{ value1: 12, value2: 5 }]),
        train(1, [{ value1: 12, value2: 8 }], false),
      ],
    });

    expect(generatePlayActions(obs)).toHaveLength(0);
    expect(defaultCandidateGenerator(obs)).toEqual([{ kind: 'draw' }]);
  });
});

describe('scenario — draw marker rule', () => {
  it('walks draw then pass through the generator and the AI', () => {
    const stuck = {
      hand: [
        { value1: 1, value2: 2 },
        { value1: 3, value2: 4 },
      ] as const,
      drawPileSize: 10,
    };

    expect(defaultCandidateGenerator(makeObs(stuck))).toEqual([{ kind: 'draw' }]);
    expect(
      defaultCandidateGenerator(makeObs({ ...stuck, turnDrawUsed: true }))
    ).toEqual([{ kind: 'pass' }]);

    const player = createAiPlayer({
      skill: getSkillProfile('advanced'),
      rng: mulberry32(4),
    });

    expect(player.decide(makeObs(stuck)).kind).toBe('draw');
    expect(
      player.decide(makeObs({ ...stuck, turnDrawUsed: true })).kind
    ).toBe('pass');
  });
});

describe('scenario — optional draw house rule', () => {
  it('lets a custom generator offer draw alongside legal plays', () => {
    const generator = createCandidateGenerator({ allowOptionalDraw: true });
    const obs = makeObs({
      hand: [
        { value1: 5, value2: 3 },
        { value1: 5, value2: 9 },
      ],
      drawPileSize: 6,
    });

    const actions = generator(obs);
    expect(actions.some((action) => action.kind === 'play')).toBe(true);
    expect(actions.some((action) => action.kind === 'draw')).toBe(true);

    const player = createAiPlayer({
      skill: getSkillProfile('advanced'),
      generateCandidates: generator,
      rng: mulberry32(8),
    });
    const decision = player.decide(obs);
    expect(actions.some((action) => action.kind === decision.kind)).toBe(true);
  });
});

describe('scenario — AI legality', () => {
  it('never returns a play the rules engine rejects', () => {
    const player = createAiPlayer({
      skill: getSkillProfile('intermediate'),
      rng: mulberry32(17),
    });

    for (let seed = 0; seed < 25; seed++) {
      const obs = makeObs({
        hand: [
          { value1: 5, value2: 3 },
          { value1: 5, value2: 9 },
          { value1: 1, value2: 2 },
          { value1: 3, value2: 4 },
        ],
        drawPileSize: seed % 3 === 0 ? 0 : 8,
        turnDrawUsed: seed % 5 === 0,
        trains: [
          train(0, [{ value1: 12, value2: 5 }]),
          train(1, [{ value1: 12, value2: 8 }], seed % 2 === 0),
        ],
        selfPlayerId: seed % 2,
      });

      const action = player.decide(obs);
      if (isPlayAction(action)) {
        const board = obs.trains[action.trainIndex];
        const result = playMove(board, action.move, obs.rules);
        expect(result.ok, `seed ${seed}`).toBe(true);
      }
    }
  });

  it('advanced prefers dumping heavier tiles on a matching open end', () => {
    const obs = makeObs({
      hand: [
        { value1: 5, value2: 3 },
        { value1: 5, value2: 9 },
      ],
    });
    const heavyKey = dominoKey({ value1: 5, value2: 9 });

    const player = createAiPlayer({
      skill: getSkillProfile('advanced'),
      rng: mulberry32(21),
    });

    let heavy = 0;
    for (let i = 0; i < 100; i++) {
      const action = player.decide(obs);
      if (isPlayAction(action)) {
        if (dominoKey(action.move.tile) === heavyKey) heavy++;
      }
    }

    expect(heavy).toBeGreaterThan(90);
  });
});
