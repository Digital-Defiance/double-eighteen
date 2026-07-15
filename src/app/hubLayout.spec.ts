import { hubTrainStartDistance } from './hubLayout';

describe('hubTrainStartDistance', () => {
  it('pushes offset trains farther out than linear (wider zigzag)', () => {
    const offset = hubTrainStartDistance(8, 80, 60, 'offset');
    const linear = hubTrainStartDistance(8, 80, 60, 'linear');
    expect(offset).toBeGreaterThan(linear);
  });

  it('grows with the number of trains so the ring never crowds', () => {
    const eight = hubTrainStartDistance(8, 80, 60, 'offset');
    const sixteen = hubTrainStartDistance(16, 80, 60, 'offset');
    expect(sixteen).toBeGreaterThan(eight);
  });

  it('never starts a train inside the hub ring (radius + 20 floor)', () => {
    // Few slots → the slot-based distance is tiny, so the floor applies.
    expect(hubTrainStartDistance(2, 80, 60, 'linear')).toBe(100);
  });

  it('keeps adjacent offset start tiles at least a tile-width apart', () => {
    const slots = 8;
    const d = hubTrainStartDistance(slots, 80, 60, 'offset');
    const neighborGap = (2 * Math.PI * d) / slots;
    expect(neighborGap).toBeGreaterThanOrEqual(60);
  });
});
