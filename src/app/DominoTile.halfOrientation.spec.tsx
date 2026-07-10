import { render } from '@testing-library/react';
import { DominoTile } from './DominoTile';

describe('DominoTile half orientation', () => {
  it('leaves half 1 upright and rotates half 2 by 180°', () => {
    const { container } = render(<DominoTile value1={13} value2={13} />);

    const half1 = container.querySelector(
      '[data-testid="domino-half"][data-half="1"]'
    ) as HTMLElement;
    const half2 = container.querySelector(
      '[data-testid="domino-half"][data-half="2"]'
    ) as HTMLElement;

    expect(half1).toBeTruthy();
    expect(half2).toBeTruthy();
    expect(half1.getAttribute('data-rotated')).toBe('false');
    expect(half2.getAttribute('data-rotated')).toBe('true');
    expect(half1.style.transform).toBe('');
    expect(half2.style.transform).toBe('rotate(180deg)');
  });

  it('rotates the second half on mixed asymmetric tiles', () => {
    const { container } = render(<DominoTile value1={14} value2={5} />);

    const half2 = container.querySelector(
      '[data-testid="domino-half"][data-half="2"]'
    ) as HTMLElement;

    expect(half2.style.transform).toBe('rotate(180deg)');
  });
});
