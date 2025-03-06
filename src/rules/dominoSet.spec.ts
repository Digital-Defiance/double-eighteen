import {
  dominoKey,
  dominoSetSize,
  generateDominoSet,
  isDouble,
  orientForConnection,
  otherEnd,
  tileKey,
} from '@/rules/dominoSet';

describe('dominoSet', () => {
  it('counts set sizes correctly', () => {
    expect(dominoSetSize(6)).toBe(28);
    expect(dominoSetSize(9)).toBe(55);
    expect(dominoSetSize(12)).toBe(91);
  });

  it('generates a full unique double-12 set', () => {
    const set = generateDominoSet(12);
    expect(set).toHaveLength(91);
    const keys = new Set(set.map(dominoKey));
    expect(keys.size).toBe(91);
    expect(set.filter(isDouble)).toHaveLength(13);
  });

  it('keys tiles order-independently', () => {
    expect(tileKey(6, 3)).toBe(tileKey(3, 6));
    expect(dominoKey({ value1: 9, value2: 2 })).toBe('2:9');
  });

  it('reads the opposite end', () => {
    expect(otherEnd({ value1: 6, value2: 3 }, 6)).toBe(3);
    expect(otherEnd({ value1: 6, value2: 3 }, 3)).toBe(6);
    expect(otherEnd({ value1: 6, value2: 3 }, 5)).toBeNull();
  });

  it('orients a tile so value1 connects', () => {
    expect(orientForConnection({ value1: 3, value2: 6 }, 6)).toEqual({
      value1: 6,
      value2: 3,
    });
    expect(orientForConnection({ value1: 6, value2: 3 }, 6)).toEqual({
      value1: 6,
      value2: 3,
    });
    expect(orientForConnection({ value1: 6, value2: 3 }, 5)).toBeNull();
  });
});
