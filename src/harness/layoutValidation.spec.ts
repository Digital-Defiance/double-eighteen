import {
  validateChickenFootChain,
  validateConsecutiveSpacing,
  validateDominoChain,
} from '@/harness/layoutValidation';
import { computeTrainLayout } from '@/app/trainLayout';
import { CHICKEN_FOOT_FIXTURES, TRAIN_FIXTURES } from '@/harness/trainFixtures';

describe('layoutValidation', () => {
  it('detects broken domino chains', () => {
    const result = validateDominoChain([
      { value1: 12, value2: 6 },
      { value1: 5, value2: 3 },
    ]);

    expect(result.valid).toBe(false);
    expect(result.issues[0]?.code).toBe('chain-break');
  });

  it('detects consecutive doubles in data', () => {
    const result = validateDominoChain([
      { value1: 12, value2: 6 },
      { value1: 6, value2: 6 },
      { value1: 6, value2: 6 },
    ]);

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'consecutive-doubles')).toBe(
      true
    );
  });

  it('flags spacing drift when centers are shifted', () => {
    const layout = computeTrainLayout({
      startX: 80,
      startY: 110,
      angle: 0,
      dominoes: [
        { value1: 12, value2: 6 },
        { value1: 6, value2: 6 },
        { value1: 6, value2: 3 },
      ],
      layoutStyle: 'linear',
    });

    const shifted = layout.map((entry, index) =>
      index === 2 ? { ...entry, x: entry.x + 20 } : entry
    );

    const result = validateConsecutiveSpacing(shifted, 0, 'linear');
    expect(result.valid).toBe(false);
    expect(result.issues[0]?.code).toBe('spacing-along-train');
  });
});

describe('validateChickenFootChain', () => {
  it('accepts a valid double with two matching toes', () => {
    const result = validateChickenFootChain({
      dominoes: [
        { value1: 12, value2: 6 },
        { value1: 6, value2: 6 },
        { value1: 6, value2: 3 },
      ],
      feet: {
        1: [
          { dominoes: [{ value1: 6, value2: 2 }] },
          { dominoes: [{ value1: 6, value2: 4 }] },
        ],
      },
    });
    expect(result.issues).toEqual([]);
  });

  it('flags a foot hanging off a non-double host', () => {
    const result = validateChickenFootChain({
      dominoes: [
        { value1: 12, value2: 6 },
        { value1: 6, value2: 3 },
      ],
      feet: { 1: [{ dominoes: [{ value1: 3, value2: 2 }] }] },
    });
    expect(result.issues.some((i) => i.code === 'foot-host-not-double')).toBe(true);
  });

  it('flags a foot referencing a tile that does not exist', () => {
    const result = validateChickenFootChain({
      dominoes: [{ value1: 6, value2: 6 }],
      feet: { 5: [{ dominoes: [{ value1: 6, value2: 2 }] }] },
    });
    expect(result.issues.some((i) => i.code === 'foot-host-missing')).toBe(true);
  });

  it('flags more than two side toes on a double', () => {
    const result = validateChickenFootChain({
      dominoes: [{ value1: 6, value2: 6 }],
      feet: {
        0: [
          { dominoes: [{ value1: 6, value2: 1 }] },
          { dominoes: [{ value1: 6, value2: 2 }] },
          { dominoes: [{ value1: 6, value2: 3 }] },
        ],
      },
    });
    expect(result.issues.some((i) => i.code === 'foot-too-many-toes')).toBe(true);
  });

  it('flags a toe whose first tile does not match the double', () => {
    const result = validateChickenFootChain({
      dominoes: [{ value1: 6, value2: 6 }],
      feet: { 0: [{ dominoes: [{ value1: 2, value2: 5 }] }] },
    });
    expect(result.issues.some((i) => i.code === 'foot-connection')).toBe(true);
  });

  it('recurses into nested feet and reports broken toes deep in the tree', () => {
    const result = validateChickenFootChain({
      dominoes: [{ value1: 6, value2: 6 }],
      feet: {
        0: [
          {
            dominoes: [
              { value1: 6, value2: 4 },
              { value1: 4, value2: 4 },
            ],
            // Nested toe starts with the wrong value (should be 4).
            feet: { 1: [{ dominoes: [{ value1: 9, value2: 1 }] }] },
          },
        ],
      },
    });
    expect(result.issues.some((i) => i.code === 'foot-connection')).toBe(true);
  });
});

describe('demo fixtures obey the rules', () => {
  it.each(TRAIN_FIXTURES.map((f) => [f.id, f] as const))(
    'train fixture "%s" is a valid sequential chain',
    (_id, fixture) => {
      expect(validateDominoChain(fixture.dominoes).issues).toEqual([]);
    }
  );

  it.each(CHICKEN_FOOT_FIXTURES.map((f) => [f.id, f] as const))(
    'chicken-foot fixture "%s" is a valid branch tree',
    (_id, fixture) => {
      expect(validateChickenFootChain(fixture.branch).issues).toEqual([]);
    }
  );
});
