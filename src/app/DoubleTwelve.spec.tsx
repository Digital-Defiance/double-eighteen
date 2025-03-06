import { render } from '@testing-library/react';
import { DoubleTwelve } from './DoubleTwelve';
import { DEFAULT_PIP_COLORS } from './pipColors';

const countPips = (container: HTMLElement) =>
  container.querySelectorAll('[data-testid="pip"]').length;

describe('DoubleTwelve', () => {
  it('renders one pip per spot summed across both halves', () => {
    const { container } = render(<DoubleTwelve value1={6} value2={3} />);
    expect(countPips(container)).toBe(9);
  });

  it('renders a blank tile (0-0) with no pips', () => {
    const { container } = render(<DoubleTwelve value1={0} value2={0} />);
    expect(countPips(container)).toBe(0);
  });

  it('renders the full double-12 (12-12) with 24 pips', () => {
    const { container } = render(<DoubleTwelve value1={12} value2={12} />);
    expect(countPips(container)).toBe(24);
  });

  it('clamps out-of-range values into 0..12', () => {
    const { container } = render(<DoubleTwelve value1={99} value2={-5} />);
    // 99 -> 12 pips, -5 -> 0 pips
    expect(countPips(container)).toBe(12);
  });

  it('defaults to a blank tile when values are omitted', () => {
    const { container } = render(<DoubleTwelve />);
    expect(countPips(container)).toBe(0);
  });

  it('applies the rotation transform to the tile root', () => {
    const { container } = render(<DoubleTwelve value1={1} value2={1} rotation={45} />);
    const root = container.firstChild as HTMLElement;
    expect(root.style.transform).toBe('rotate(45deg)');
  });

  it('honors width and height props', () => {
    const { container } = render(
      <DoubleTwelve value1={1} value2={1} width={80} height={160} />
    );
    const root = container.firstChild as HTMLElement;
    expect(root.style.width).toBe('80px');
    expect(root.style.height).toBe('160px');
  });

  it('uses a custom per-value pip color when pipColors is provided', () => {
    const { container } = render(
      <DoubleTwelve value1={6} value2={0} pipColors={{ 6: { color: 'rgb(1, 2, 3)' } }} />
    );
    const pips = Array.from(
      container.querySelectorAll<HTMLElement>('[data-testid="pip"]')
    );
    expect(pips).toHaveLength(6);
    expect(pips.every((pip) => pip.style.backgroundColor === 'rgb(1, 2, 3)')).toBe(true);
  });

  it('renders hollow pips (transparent fill + border) for the default 4', () => {
    const { container } = render(
      <DoubleTwelve value1={4} value2={0} pipColors={DEFAULT_PIP_COLORS} />
    );
    const pips = Array.from(
      container.querySelectorAll<HTMLElement>('[data-testid="pip"]')
    );
    expect(pips).toHaveLength(4);
    expect(pips.every((pip) => pip.style.backgroundColor === 'transparent')).toBe(true);
    expect(pips.every((pip) => pip.style.border.includes('solid'))).toBe(true);
  });

  it('falls back to the flat pipColor when no pipColors map is given', () => {
    const { container } = render(
      <DoubleTwelve value1={5} value2={0} pipColor="rgb(9, 9, 9)" />
    );
    const pips = Array.from(
      container.querySelectorAll<HTMLElement>('[data-testid="pip"]')
    );
    expect(pips.every((pip) => pip.style.backgroundColor === 'rgb(9, 9, 9)')).toBe(true);
  });
});
