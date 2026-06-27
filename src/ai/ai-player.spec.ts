import { DominoValue } from '@/game/DominoValue';
import { TrainData } from '@/game/TrainData';
import { resolveRules } from '@/rules/rulesConfig';
import { playMove } from '@/rules/placement';
import { createAiPlayer } from './create-ai-player';
import { DEFAULT_HEURISTICS } from './heuristics';
import { getSkillProfile, SKILL_PRESETS } from './skill-profiles';
import { generatePlayActions } from './candidate-generator';
import {
  AiAction,
  AiActionBase,
  AiObservation,
  isPlayAction,
} from './types';

/** Deterministic mulberry32 RNG so every assertion is reproducible. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rules = resolveRules();

function ownTrain(dominoes: DominoValue[]): TrainData {
  return { playerId: 0, isPublic: false, dominoes };
}

function makeObs(overrides: Partial<AiObservation> = {}): AiObservation {
  return {
    selfPlayerId: 0,
    hand: [],
    rules,
    engineValue: 12,
    trains: [ownTrain([{ value1: 12, value2: 5 }])],
    ...overrides,
  };
}

describe('createAiPlayer', () => {
  it('only ever returns an action from the generated candidate set', () => {
    const obs = makeObs({
      hand: [
        { value1: 5, value2: 3 },
        { value1: 5, value2: 9 },
        { value1: 1, value2: 2 },
      ],
    });
    const player = createAiPlayer({
      skill: getSkillProfile('advanced'),
      rng: seeded(1),
    });

    const action = player.decide(obs);
    expect(action.kind).toBe('play');
    if (isPlayAction(action)) {
      // The chosen play must actually be legal against the rules engine.
      const train = obs.trains[action.trainIndex];
      const result = playMove(train, action.move, obs.rules);
      expect(result.ok).toBe(true);
    }
  });

  it('draws when it holds no playable tile', () => {
    const obs = makeObs({
      hand: [
        { value1: 1, value2: 2 },
        { value1: 3, value2: 4 },
      ],
    });
    const player = createAiPlayer({
      skill: getSkillProfile('advanced'),
      rng: seeded(2),
    });
    expect(player.decide(obs).kind).toBe('draw');
  });

  it('passes when there is no play and the draw pile is empty', () => {
    const obs = makeObs({
      hand: [{ value1: 1, value2: 2 }],
      drawPileSize: 0,
    });
    const player = createAiPlayer({
      skill: getSkillProfile('advanced'),
      rng: seeded(3),
    });
    expect(player.decide(obs).kind).toBe('pass');
  });

  it('draws only once per turn, then passes (the marker rule)', () => {
    // No playable tile and a full pile: first it draws...
    const base = {
      hand: [
        { value1: 1, value2: 2 },
        { value1: 3, value2: 4 },
      ] as DominoValue[],
      drawPileSize: 10,
    };
    const player = createAiPlayer({
      skill: getSkillProfile('advanced'),
      rng: seeded(5),
    });

    expect(player.decide(makeObs(base)).kind).toBe('draw');
    // ...but once the host marks the single draw used, it must pass (which is
    // what flips its own train public) instead of draining the pile.
    expect(
      player.decide(makeObs({ ...base, turnDrawUsed: true })).kind
    ).toBe('pass');
  });

  it('scales: advanced dumps the heavier tile far more reliably than beginner', () => {
    // Two legal plays on the open 5: a light 5-3 (8 pips) vs a heavy 5-9 (14).
    const obs = makeObs({
      hand: [
        { value1: 5, value2: 3 },
        { value1: 5, value2: 9 },
      ],
    });
    const heavyKey = '5:9';

    const tally = (level: 'beginner' | 'advanced'): number => {
      const player = createAiPlayer({
        skill: SKILL_PRESETS[level],
        rng: seeded(level === 'beginner' ? 100 : 200),
      });
      let heavy = 0;
      for (let i = 0; i < 400; i++) {
        const action = player.decide(obs);
        if (isPlayAction(action)) {
          const t = action.move.tile;
          const key = t.value1 <= t.value2 ? `${t.value1}:${t.value2}` : `${t.value2}:${t.value1}`;
          if (key === heavyKey) heavy++;
        }
      }
      return heavy / 400;
    };

    const beginnerRate = tally('beginner');
    const advancedRate = tally('advanced');

    expect(advancedRate).toBeGreaterThan(0.9);
    expect(advancedRate).toBeGreaterThan(beginnerRate);
    expect(beginnerRate).toBeLessThan(0.85);
  });

  it('is extensible: custom action + heuristic + generator flow through scoring', () => {
    interface DeployBeaconAction extends AiActionBase {
      kind: 'deploy-beacon';
    }
    type WarpAction = AiAction | DeployBeaconAction;

    const obs = makeObs({ hand: [{ value1: 5, value2: 9 }] });

    const beaconHeuristic = {
      id: 'beacon-pref',
      score(action: AiActionBase): number {
        return action.kind === 'deploy-beacon' ? 1000 : 0;
      },
    };

    const base = SKILL_PRESETS.advanced;
    const player = createAiPlayer<WarpAction>({
      skill: {
        ...base,
        enabled: new Set([...base.enabled, 'beacon-pref']),
        weights: { ...base.weights, 'beacon-pref': 1 },
      },
      heuristics: [...DEFAULT_HEURISTICS, beaconHeuristic],
      generateCandidates: (o): WarpAction[] => [
        { kind: 'deploy-beacon' },
        ...generatePlayActions(o),
      ],
      rng: seeded(7),
    });

    expect(player.decide(obs).kind).toBe('deploy-beacon');
  });
});
