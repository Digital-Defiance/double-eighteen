import {
  DEFAULT_RULES,
  requiredDoubleAnswers,
  resolveRules,
  sideToeSlots,
} from '@/rules/rulesConfig';

describe('rulesConfig', () => {
  it('fills defaults and tracks engineValue to maxPips', () => {
    expect(resolveRules()).toEqual(DEFAULT_RULES);
    expect(resolveRules({ maxPips: 9 }).engineValue).toBe(9);
    expect(resolveRules({ maxPips: 9, engineValue: 0 }).engineValue).toBe(0);
  });

  it('deep-merges chickenFoot overrides', () => {
    const config = resolveRules({ chickenFoot: { toeCount: 5 } as never });
    expect(config.chickenFoot.toeCount).toBe(5);
    expect(config.chickenFoot.sideToeAngles).toEqual([-45, 45]);
  });

  it('reports required answers per obligation', () => {
    expect(requiredDoubleAnswers(resolveRules({ doubleObligation: 'none' }))).toBe(0);
    expect(requiredDoubleAnswers(resolveRules({ doubleObligation: 'cover' }))).toBe(1);
    expect(
      requiredDoubleAnswers(resolveRules({ doubleObligation: 'chicken-foot' }))
    ).toBe(3);
  });

  it('exposes side-toe slots only for chicken foot', () => {
    expect(sideToeSlots(resolveRules({ doubleObligation: 'cover' }))).toBe(0);
    expect(sideToeSlots(resolveRules({ doubleObligation: 'none' }))).toBe(0);
    expect(
      sideToeSlots(resolveRules({ doubleObligation: 'chicken-foot' }))
    ).toBe(2);
  });
});
