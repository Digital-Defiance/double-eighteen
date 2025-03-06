/**
 * How a played double must be answered before play continues.
 * - `none`: doubles are ordinary tiles.
 * - `cover`: the double must be answered by one tile on its open end.
 * - `chicken-foot`: the double must grow a full foot (`chickenFoot.toeCount`
 *   answers: the straight center continuation plus the angled side toes).
 */
export type DoubleObligation = 'none' | 'cover' | 'chicken-foot';

export interface ChickenFootConfig {
  /**
   * Total toes a double must grow to be satisfied, counting the straight center
   * continuation as one. Stays 3 by default (center + two ±angle side toes).
   */
  toeCount: number;
  /** Angles (degrees, relative to the train) of the side toes (toeCount - 1). */
  sideToeAngles: number[];
}

/**
 * Every knob that governs legal play. Pass a partial override to {@link resolveRules}
 * to get a fully-populated config; unspecified fields fall back to DEFAULT_RULES.
 */
export interface RulesConfig {
  /** Highest pip value in the set (12 → double-12, 91 tiles). */
  maxPips: number;
  /** Value of the starting engine double (defaults to maxPips). */
  engineValue: number;
  /** Forbid a double immediately following a double in a chain. */
  allowConsecutiveDoubles: boolean;
  /** Each physical tile may be placed at most once across all play. */
  requireUniqueTiles: boolean;
  /** A tile may only attach where one of its ends matches the open value. */
  requireSequential: boolean;
  /** Obligation imposed by playing a double. */
  doubleObligation: DoubleObligation;
  chickenFoot: ChickenFootConfig;
}

export const DEFAULT_RULES: RulesConfig = {
  maxPips: 12,
  engineValue: 12,
  allowConsecutiveDoubles: false,
  requireUniqueTiles: true,
  requireSequential: true,
  doubleObligation: 'cover',
  chickenFoot: {
    toeCount: 3,
    sideToeAngles: [-45, 45],
  },
};

/** Number of answers a double needs to be satisfied under the given rules. */
export function requiredDoubleAnswers(config: RulesConfig): number {
  switch (config.doubleObligation) {
    case 'chicken-foot':
      return Math.max(1, config.chickenFoot.toeCount);
    case 'cover':
      return 1;
    case 'none':
    default:
      return 0;
  }
}

/** Number of angled side-toe slots a double exposes (center is the main line). */
export function sideToeSlots(config: RulesConfig): number {
  if (config.doubleObligation === 'chicken-foot') {
    return Math.max(0, config.chickenFoot.toeCount - 1);
  }
  // Outside chicken-foot, doubles do not branch; covers go on the main line.
  return 0;
}

/** Fills in any missing fields from DEFAULT_RULES (engineValue tracks maxPips). */
export function resolveRules(overrides: Partial<RulesConfig> = {}): RulesConfig {
  const maxPips = overrides.maxPips ?? DEFAULT_RULES.maxPips;
  return {
    ...DEFAULT_RULES,
    ...overrides,
    maxPips,
    engineValue: overrides.engineValue ?? maxPips,
    chickenFoot: {
      ...DEFAULT_RULES.chickenFoot,
      ...(overrides.chickenFoot ?? {}),
    },
  };
}
