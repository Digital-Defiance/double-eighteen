import { render } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
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

const TILE = '[data-testid="domino-tile"]';

describe('DominoTrain', () => {
  it('renders high-value tiles when maxPips is 18', () => {
    const trainData: TrainData = {
      playerId: 0,
      isPublic: false,
      dominoes: [{ value1: 18, value2: 17 }],
    };
    const { container } = render(
      <DominoTrain {...baseProps} trainData={trainData} maxPips={18} />
    );
    expect(container.querySelectorAll('[data-testid="pip"]').length).toBe(35);
    expect(container.querySelectorAll(TILE).length).toBe(1);
  });

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

  describe('rule enforcement (dev guard)', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('warns when a train chain does not connect by value', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      renderTrain({
        playerId: 4,
        isPublic: false,
        // 6 does not connect to 9 → an illegal sequence.
        dominoes: [
          { value1: 12, value2: 6 },
          { value1: 9, value2: 3 },
        ],
      });
      expect(warn).toHaveBeenCalled();
      expect(String(warn.mock.calls[0])).toMatch(/does not follow the rules|does not connect/i);
    });

    it('does not warn for a valid chain', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      renderTrain({
        playerId: 5,
        isPublic: false,
        dominoes: [
          { value1: 12, value2: 6 },
          { value1: 6, value2: 6 },
          { value1: 6, value2: 3 },
        ],
      });
      expect(warn).not.toHaveBeenCalled();
    });
  });
});
