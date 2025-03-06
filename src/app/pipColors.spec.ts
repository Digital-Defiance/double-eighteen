import {
  DEFAULT_PIP_COLORS,
  PIP_COLORS,
  getPipStyle,
  mergePipColors,
  resolvePipStyle,
} from './pipColors';

describe('pipColors: mergePipColors', () => {
  it('returns the default set when no overrides are given', () => {
    expect(mergePipColors()).toEqual(DEFAULT_PIP_COLORS);
  });

  it('overlays overrides on top of the defaults without mutating defaults', () => {
    const merged = mergePipColors({ 6: { color: 'hotpink' } });
    expect(merged[6]).toEqual({ color: 'hotpink' });
    // untouched values keep their defaults
    expect(merged[1]).toEqual(DEFAULT_PIP_COLORS[1]);
    // defaults object is not mutated
    expect(DEFAULT_PIP_COLORS[6]).toEqual({ color: '#2563EB' });
  });

  it('can introduce values not present in the defaults', () => {
    const merged = mergePipColors({ 99: { color: 'cyan' } });
    expect(merged[99]).toEqual({ color: 'cyan' });
  });
});

describe('pipColors: resolvePipStyle', () => {
  it('returns undefined when colored pips are disabled (no map)', () => {
    expect(resolvePipStyle(6, undefined)).toBeUndefined();
  });

  it('uses the provided map value when present', () => {
    expect(resolvePipStyle(6, { 6: { color: 'teal' } })).toEqual({ color: 'teal' });
  });

  it('falls back to the default for a value missing from the map', () => {
    expect(resolvePipStyle(5, {})).toEqual(DEFAULT_PIP_COLORS[5]);
  });

  it('falls back to a sane black for an unknown value', () => {
    expect(resolvePipStyle(99, {})).toEqual({ color: '#1a1a1a' });
  });

  it('preserves the hollow flag from the map', () => {
    expect(resolvePipStyle(4, DEFAULT_PIP_COLORS)).toEqual({
      color: '#e8e8e8',
      hollow: true,
    });
  });
});

describe('pipColors: deprecated aliases', () => {
  it('PIP_COLORS aliases DEFAULT_PIP_COLORS', () => {
    expect(PIP_COLORS).toBe(DEFAULT_PIP_COLORS);
  });

  it('getPipStyle resolves against the default set', () => {
    expect(getPipStyle(6)).toEqual(DEFAULT_PIP_COLORS[6]);
    expect(getPipStyle(0)).toEqual(DEFAULT_PIP_COLORS[0]);
  });
});

describe('pipColors: default set', () => {
  it('defines a style for every value 0..12', () => {
    for (let value = 0; value <= 12; value++) {
      expect(DEFAULT_PIP_COLORS[value]).toBeDefined();
    }
  });

  it('renders blanks (0) as transparent', () => {
    expect(DEFAULT_PIP_COLORS[0]).toEqual({ color: 'transparent' });
  });
});
