import {
  computeTrainLayout,
  orientDominoValues,
} from './trainLayout';

const chain = (...vals: number[]) =>
  vals.slice(0, -1).map((v, i) => ({ value1: v, value2: vals[i + 1] }));

describe('orientDominoValues', () => {
  it('leaves a correctly-stored chain untouched', () => {
    const input = chain(12, 6, 3, 1);
    expect(orientDominoValues(input)).toEqual(input);
  });

  it('flips a tile that is stored reversed so value1 connects', () => {
    // Second tile stored as 3-6 instead of 6-3.
    const input = [
      { value1: 12, value2: 6 },
      { value1: 3, value2: 6 },
      { value1: 3, value2: 1 },
    ];
    const oriented = orientDominoValues(input);
    expect(oriented[1]).toEqual({ value1: 6, value2: 3 });
    expect(oriented[2]).toEqual({ value1: 3, value2: 1 });
  });

  it('never flips doubles', () => {
    const input = chain(12, 6).concat({ value1: 6, value2: 6 }, { value1: 6, value2: 3 });
    const oriented = orientDominoValues(input);
    expect(oriented[1]).toEqual({ value1: 6, value2: 6 });
  });
});

describe('touching values match after layout', () => {
  // A chain with a double, which previously rendered flipped in linear mode.
  const dominoes = chain(12, 6).concat(
    { value1: 6, value2: 6 },
    { value1: 6, value2: 3 },
    { value1: 3, value2: 1 }
  );

  for (const layoutStyle of ['linear', 'offset'] as const) {
    it(`keeps value1[i] === value2[i-1] across the run (${layoutStyle})`, () => {
      const layout = computeTrainLayout({
        startX: 0,
        startY: 0,
        angle: 0,
        dominoes,
        layoutStyle,
      });
      for (let i = 1; i < layout.length; i++) {
        expect(layout[i].value1, `tile ${i} should connect to tile ${i - 1}`).toBe(
          layout[i - 1].value2
        );
      }
    });
  }
});
