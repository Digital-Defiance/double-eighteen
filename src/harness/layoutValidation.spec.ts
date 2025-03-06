import { validateDominoChain, validateConsecutiveSpacing } from '@/harness/layoutValidation';
import { computeTrainLayout } from '@/app/trainLayout';

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
