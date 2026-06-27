import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BendHarness from './BendHarness';

const renderHarness = (path = '/harness/bends') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <BendHarness />
    </MemoryRouter>
  );

// Clicks main-run tiles until one actually folds (some are collision-blocked by
// the neighbour train or the chicken-foot toes). Returns the tile index, or -1.
const clickUntilBent = (utils: ReturnType<typeof renderHarness>): number => {
  for (let i = 1; i <= 12; i++) {
    const el = utils.queryByTestId(`bend-tile-${i}`);
    if (!el) continue;
    fireEvent.click(el);
    if (utils.getByTestId('bend-count').textContent?.includes('1 bend')) {
      return i;
    }
  }
  return -1;
};

describe('BendHarness', () => {
  it('renders bendable main-run tiles inside a viewport', () => {
    const { getByTestId } = renderHarness();
    expect(getByTestId('bend-viewport')).toBeTruthy();
    expect(getByTestId('bend-tile-3')).toBeTruthy();
  });

  it('cycles a tile through bend states on repeated clicks', () => {
    const utils = renderHarness();
    const readCount = () => utils.getByTestId('bend-count').textContent;

    expect(readCount()).toContain('0 bend');
    const tile = clickUntilBent(utils);
    expect(tile, 'expected at least one bendable tile').not.toBe(-1);
    expect(readCount()).toContain('1 bend');

    // Keep clicking the same tile; the cycle must eventually return to straight.
    // (Cycle length is 2 or 3 depending on whether one side is collision-blocked.)
    let returnedToStraight = false;
    for (let i = 0; i < 3; i++) {
      fireEvent.click(utils.getByTestId(`bend-tile-${tile}`));
      if (readCount()?.includes('0 bend')) {
        returnedToStraight = true;
        break;
      }
    }
    expect(returnedToStraight).toBe(true);
  });

  it('clears all bends with the reset control', () => {
    const utils = renderHarness();
    expect(clickUntilBent(utils)).not.toBe(-1);
    expect(utils.getByTestId('bend-count').textContent).toContain('1 bend');
    fireEvent.click(utils.getByTestId('bend-reset'));
    expect(utils.getByTestId('bend-count').textContent).toContain('0 bend');
  });

  it('honors the linear layout query param', () => {
    const { getByTestId } = renderHarness('/harness/bends?layout=linear');
    expect(getByTestId('bend-harness-layout').getAttribute('data-layout-style')).toBe(
      'linear'
    );
  });
});
