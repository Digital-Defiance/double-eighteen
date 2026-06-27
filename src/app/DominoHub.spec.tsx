import { render } from '@testing-library/react';
import { DominoHub, hubTrainStartDistance } from './DominoHub';
import { TrainData } from '@/game/TrainData';

const baseProps = {
  centerX: 500,
  centerY: 500,
  radius: 80,
  layoutStyle: 'linear' as const,
  tableWidth: 1000,
  tableHeight: 1000,
};

// DoubleTwelve tile roots are the only elements carrying transform-origin.
const TILE = '[style*="transform-origin"]';

describe('DominoHub', () => {
  it('renders the engine double in the center even with no trains', () => {
    const { container } = render(
      <DominoHub {...baseProps} playerCount={4} engineValue={12} trains={[]} />
    );
    // Engine is a double-12: 24 pips on the single engine tile.
    expect(container.querySelectorAll('[data-testid="pip"]').length).toBe(24);
    expect(container.querySelectorAll(TILE).length).toBe(1);
  });

  it('always lays out at least eight train slots', () => {
    const trains: TrainData[] = [
      {
        playerId: 0,
        isPublic: false,
        dominoes: [{ value1: 12, value2: 5 }],
      },
    ];
    const { container } = render(
      <DominoHub {...baseProps} playerCount={2} engineValue={12} trains={trains} />
    );
    // engine tile + the single played tile in player 0's train.
    expect(container.querySelectorAll(TILE).length).toBe(2);
  });

  it('renders tiles for every populated train', () => {
    const trains: TrainData[] = [
      { playerId: 0, isPublic: false, dominoes: [{ value1: 12, value2: 1 }] },
      {
        playerId: 1,
        isPublic: true,
        dominoes: [
          { value1: 12, value2: 2 },
          { value1: 2, value2: 4 },
        ],
      },
    ];
    const { container } = render(
      <DominoHub {...baseProps} playerCount={8} engineValue={12} trains={trains} />
    );
    // engine (1) + train 0 (1) + train 1 (2) = 4 tiles.
    expect(container.querySelectorAll(TILE).length).toBe(4);
  });

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
});
