import { render } from '@testing-library/react';
import { DominoHub } from './DominoHub';
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
});
