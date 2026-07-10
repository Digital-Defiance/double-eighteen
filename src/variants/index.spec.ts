import {
  clampPipValue,
  DOMINO_SETS,
  normalizeSetSize,
  resolveRulesForSet,
} from './index';

describe('variants', () => {
  it('defines tile counts for all supported sets', () => {
    expect(DOMINO_SETS[9].tileCount).toBe(55);
    expect(DOMINO_SETS[12].tileCount).toBe(91);
    expect(DOMINO_SETS[15].tileCount).toBe(136);
    expect(DOMINO_SETS[18].tileCount).toBe(190);
  });

  it('clamps pip values to [0, maxPips]', () => {
    expect(clampPipValue(-5, 12)).toBe(0);
    expect(clampPipValue(6.7, 12)).toBe(7);
    expect(clampPipValue(99, 18)).toBe(18);
  });

  it('normalizes unsupported set sizes to 18', () => {
    expect(normalizeSetSize(undefined)).toBe(18);
    expect(normalizeSetSize(12)).toBe(12);
    expect(normalizeSetSize(7)).toBe(18);
  });

  it('resolves rules for a set preset', () => {
    const rules = resolveRulesForSet(15);
    expect(rules.maxPips).toBe(15);
    expect(rules.engineValue).toBe(15);
  });
});
