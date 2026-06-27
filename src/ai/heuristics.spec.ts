import { DominoValue } from '@/game/DominoValue';
import { TrainData } from '@/game/TrainData';
import { dominoKey, generateDominoSet } from '@/rules/dominoSet';
import { resolveRules } from '@/rules/rulesConfig';

import { collectAllPlayedKeys } from './candidate-generator';
import { DEFAULT_HEURISTICS, HEURISTIC_IDS } from './heuristics';
import { scoreWithHeuristics } from './policy';
import { getSkillProfile } from './skill-profiles';
import type { AiObservation, AiPlayAction, EvalContext } from './types';

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

function heuristicById(id: string) {
  const found = DEFAULT_HEURISTICS.find((entry) => entry.id === id);
  if (!found) {
    throw new Error(`missing heuristic: ${id}`);
  }
  return found;
}

function buildContext(
  obs: AiObservation,
  candidates: EvalContext['candidates']
): EvalContext {
  const playedKeys = collectAllPlayedKeys(obs.trains);
  const seen = new Set<string>(playedKeys);
  for (const tile of obs.hand) {
    seen.add(dominoKey(tile));
  }
  const unseen = generateDominoSet(obs.rules.maxPips).filter(
    (tile) => !seen.has(dominoKey(tile))
  );

  return {
    obs,
    playedKeys,
    candidates,
    playCandidates: candidates.filter(
      (action): action is AiPlayAction => action.kind === 'play'
    ),
    unseen,
    rng: () => 0,
  };
}

function scoreAction(
  action: EvalContext['candidates'][number],
  obs: AiObservation,
  candidates: EvalContext['candidates'],
  heuristicId: string
): number {
  const heuristic = heuristicById(heuristicId);
  const byId = new Map([[heuristic.id, heuristic]]);
  const skill = {
    ...getSkillProfile('advanced'),
    enabled: new Set([heuristicId]),
    weights: { [heuristicId]: 1 },
  };

  return scoreWithHeuristics(action, buildContext(obs, candidates), byId, skill);
}

describe('DEFAULT_HEURISTICS', () => {
  it('prefer-play ranks play above draw and pass', () => {
    const obs = makeObs();
    const candidates = [
      { kind: 'pass' as const },
      { kind: 'draw' as const },
      {
        kind: 'play' as const,
        trainIndex: 0,
        move: {
          tile: { value1: 5, value2: 3 },
          end: { value: 5, obligation: false },
        },
      },
    ];

    const play = scoreAction(candidates[2], obs, candidates, HEURISTIC_IDS.preferPlay);
    const draw = scoreAction(candidates[1], obs, candidates, HEURISTIC_IDS.preferPlay);
    const pass = scoreAction(candidates[0], obs, candidates, HEURISTIC_IDS.preferPlay);

    expect(play).toBeGreaterThan(draw);
    expect(draw).toBeGreaterThan(pass);
  });

  it('dump-pips favors heavier tiles', () => {
    const obs = makeObs({
      hand: [
        { value1: 5, value2: 3 },
        { value1: 5, value2: 9 },
      ],
    });
    const candidates = [
      {
        kind: 'play' as const,
        trainIndex: 0,
        move: {
          tile: { value1: 5, value2: 3 },
          end: { value: 5, obligation: false },
        },
      },
      {
        kind: 'play' as const,
        trainIndex: 0,
        move: {
          tile: { value1: 5, value2: 9 },
          end: { value: 5, obligation: false },
        },
      },
    ];

    const light = scoreAction(
      candidates[0],
      obs,
      candidates,
      HEURISTIC_IDS.dumpPips
    );
    const heavy = scoreAction(
      candidates[1],
      obs,
      candidates,
      HEURISTIC_IDS.dumpPips
    );

    expect(heavy).toBeGreaterThan(light);
  });

  it('own-train rewards building on your line over a public opponent train', () => {
    const obs = makeObs({
      hand: [{ value1: 5, value2: 3 }, { value1: 8, value2: 3 }],
      trains: [
        train(0, [{ value1: 12, value2: 5 }]),
        train(1, [{ value1: 12, value2: 8 }], true),
      ],
    });
    const candidates = [
      {
        kind: 'play' as const,
        trainIndex: 0,
        move: {
          tile: { value1: 5, value2: 3 },
          end: { value: 5, obligation: false },
        },
      },
      {
        kind: 'play' as const,
        trainIndex: 1,
        move: {
          tile: { value1: 8, value2: 3 },
          end: { value: 8, obligation: false },
        },
      },
    ];

    const own = scoreAction(
      candidates[0],
      obs,
      candidates,
      HEURISTIC_IDS.ownTrain
    );
    const publicTrain = scoreAction(
      candidates[1],
      obs,
      candidates,
      HEURISTIC_IDS.ownTrain
    );

    expect(own).toBeGreaterThan(publicTrain);
  });

  it('defensive-public penalizes easy follow-ups on shared trains', () => {
    const obs = makeObs({
      hand: [{ value1: 8, value2: 3 }],
      trains: [
        train(0, [{ value1: 12, value2: 5 }]),
        train(1, [{ value1: 12, value2: 8 }], true),
      ],
    });
    const candidates = [
      {
        kind: 'play' as const,
        trainIndex: 1,
        move: {
          tile: { value1: 8, value2: 3 },
          end: { value: 8, obligation: false },
        },
      },
    ];
    const ctx = buildContext(obs, candidates);
    const defensive = heuristicById(HEURISTIC_IDS.defensivePublic);

    const score = defensive.score(candidates[0], ctx);
    expect(score).toBeLessThan(0);
  });
});

describe('getSkillProfile', () => {
  it('returns cloned presets with the expected heuristic sets', () => {
    const beginner = getSkillProfile('beginner');
    const advanced = getSkillProfile('advanced');

    expect(beginner.enabled.has(HEURISTIC_IDS.preferPlay)).toBe(true);
    expect(beginner.enabled.has(HEURISTIC_IDS.defensivePublic)).toBe(false);
    expect(advanced.enabled.has(HEURISTIC_IDS.defensivePublic)).toBe(true);
    expect(advanced.blunderRate).toBe(0);
  });
});
