import { render } from '@testing-library/react';
import { DominoTrain } from './DominoTrain';
import { TrainData } from '@/game/TrainData';

const baseProps = {
  startX: 200,
  startY: 200,
  angle: 0,
  layoutStyle: 'linear' as const,
  tableWidth: 1000,
  tableHeight: 1000,
  centerX: 500,
  centerY: 500,
};

const renderTrain = (trainData: TrainData) =>
  render(<DominoTrain {...baseProps} trainData={trainData} />);

// DoubleTwelve tile roots are the only elements carrying transform-origin.
const TILE = '[style*="transform-origin"]';

describe('DominoTrain', () => {
  it('renders one tile per domino in the run', () => {
    const trainData: TrainData = {
      playerId: 0,
      isPublic: false,
      dominoes: [
        { value1: 12, value2: 6 },
        { value1: 6, value2: 3 },
        { value1: 3, value2: 1 },
      ],
    };
    const { container } = renderTrain(trainData);
    expect(container.querySelectorAll(TILE).length).toBe(3);
  });

  it('renders an empty fragment for an empty train', () => {
    const { container } = renderTrain({
      playerId: 1,
      isPublic: false,
      dominoes: [],
    });
    expect(container.querySelectorAll('[data-testid="pip"]').length).toBe(0);
    expect(container.querySelectorAll(TILE).length).toBe(0);
  });

  it('includes side toes from chicken feet in the rendered tiles', () => {
    const withFeet: TrainData = {
      playerId: 2,
      isPublic: true,
      dominoes: [
        { value1: 12, value2: 6 },
        { value1: 6, value2: 6 },
        { value1: 6, value2: 2 },
      ],
      feet: {
        1: [{ dominoes: [{ value1: 6, value2: 4 }] }],
      },
    };
    const { container } = renderTrain(withFeet);
    // 3 main-line tiles + 1 side toe.
    expect(container.querySelectorAll(TILE).length).toBe(4);
  });

  it('marks a public train with a red tile border', () => {
    const { container } = renderTrain({
      playerId: 3,
      isPublic: true,
      dominoes: [{ value1: 12, value2: 6 }],
    });
    const root = container.querySelector<HTMLElement>(TILE);
    expect(root?.style.borderColor).toBe('red');
  });
});
