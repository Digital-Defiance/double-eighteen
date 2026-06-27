import { DominoValue } from '@/game/DominoValue';
import { TrainData } from '@/game/TrainData';
import { resolveRules, type RulesConfig } from '@/rules/rulesConfig';

import type { AiObservation } from './types';

/** Deterministic mulberry32 RNG for reproducible AI tests. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const DEFAULT_TEST_RULES: RulesConfig = resolveRules({
  doubleObligation: 'none',
});

export function train(
  playerId: number,
  dominoes: DominoValue[],
  isPublic = false
): TrainData {
  return { playerId, isPublic, dominoes };
}

export function makeObs(overrides: Partial<AiObservation> = {}): AiObservation {
  return {
    selfPlayerId: 0,
    hand: [],
    rules: DEFAULT_TEST_RULES,
    engineValue: 12,
    trains: [train(0, [{ value1: 12, value2: 5 }])],
    ...overrides,
  };
}
