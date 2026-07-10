import { resolveRules, type RulesConfig } from '../rules/rulesConfig';
import { dominoSetSize } from '../rules/dominoSet';

/** Supported double-N set sizes. */
export const DOMINO_SETS = {
  9: { maxPips: 9, tileCount: dominoSetSize(9), engineValue: 9 },
  12: { maxPips: 12, tileCount: dominoSetSize(12), engineValue: 12 },
  15: { maxPips: 15, tileCount: dominoSetSize(15), engineValue: 15 },
  18: { maxPips: 18, tileCount: dominoSetSize(18), engineValue: 18 },
} as const;

export type DominoSetSize = keyof typeof DOMINO_SETS;

const VALID_SET_SIZES = new Set<number>([9, 12, 15, 18]);

/** Coerce an arbitrary number to the nearest supported set size (defaults to 18). */
export function normalizeSetSize(value: number | undefined): DominoSetSize {
  if (value === 9 || value === 12 || value === 15 || value === 18) {
    return value;
  }
  return 18;
}

/** Clamp a pip value to [0, maxPips]. */
export function clampPipValue(value: number, maxPips: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(maxPips, Math.round(value)));
}

/** Resolve rules for a supported double-N set. */
export function resolveRulesForSet(
  setSize: DominoSetSize,
  overrides: Partial<RulesConfig> = {}
): RulesConfig {
  const preset = DOMINO_SETS[setSize];
  return resolveRules({
    maxPips: preset.maxPips,
    engineValue: preset.engineValue,
    ...overrides,
  });
}

/** Whether a number is a supported double-N set size. */
export function isDominoSetSize(value: number): value is DominoSetSize {
  return VALID_SET_SIZES.has(value);
}
