import { render } from '@testing-library/react';
import type { FC } from 'react';
import {
  DoubleEighteen,
  DoubleFifteen,
  DoubleNine,
  DoubleTwelve,
} from './DominoSetPresets';
import { DEFAULT_PIP_COLORS } from './pipColors';

const countPips = (container: HTMLElement) =>
  container.querySelectorAll('[data-testid="pip"]').length;

const PRESETS: {
  name: string;
  maxPips: number;
  Component: FC<{ value1?: number; value2?: number }>;
}[] = [
  { name: 'DoubleNine', maxPips: 9, Component: DoubleNine },
  { name: 'DoubleTwelve', maxPips: 12, Component: DoubleTwelve },
  { name: 'DoubleFifteen', maxPips: 15, Component: DoubleFifteen },
  { name: 'DoubleEighteen', maxPips: 18, Component: DoubleEighteen },
];

describe.each(PRESETS)('$name preset', ({ maxPips, Component }) => {
  it('clamps out-of-range values into 0..maxPips', () => {
    const { container } = render(<Component value1={99} value2={-5} />);
    expect(countPips(container)).toBe(maxPips);
  });

  it('renders the engine double with maxPips pips on each half', () => {
    const { container } = render(
      <Component value1={maxPips} value2={maxPips} />
    );
    expect(countPips(container)).toBe(maxPips * 2);
  });

  it('defaults to a blank tile when values are omitted', () => {
    const { container } = render(<Component />);
    expect(countPips(container)).toBe(0);
  });
});

describe('DoubleTwelve preset', () => {
  it('renders one pip per spot summed across both halves', () => {
    const { container } = render(<DoubleTwelve value1={6} value2={3} />);
    expect(countPips(container)).toBe(9);
  });

  it('applies the rotation transform to the tile root', () => {
    const { container } = render(
      <DoubleTwelve value1={1} value2={1} rotation={45} />
    );
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
      <DoubleTwelve
        value1={6}
        value2={0}
        pipColors={{ 6: { color: 'rgb(1, 2, 3)' } }}
      />
    );
    const pips = Array.from(
      container.querySelectorAll<HTMLElement>('[data-testid="pip"]')
    );
    expect(pips).toHaveLength(6);
    expect(
      pips.every((pip) => pip.style.backgroundColor === 'rgb(1, 2, 3)')
    ).toBe(true);
  });

  it('renders hollow pips (transparent fill + border) for the default 4', () => {
    const { container } = render(
      <DoubleTwelve value1={4} value2={0} pipColors={DEFAULT_PIP_COLORS} />
    );
    const pips = Array.from(
      container.querySelectorAll<HTMLElement>('[data-testid="pip"]')
    );
    expect(pips).toHaveLength(4);
    expect(
      pips.every((pip) => pip.style.backgroundColor === 'transparent')
    ).toBe(true);
    expect(pips.every((pip) => pip.style.border.includes('solid'))).toBe(
      true
    );
  });

  it('falls back to the flat pipColor when no pipColors map is given', () => {
    const { container } = render(
      <DoubleTwelve value1={5} value2={0} pipColor="rgb(9, 9, 9)" />
    );
    const pips = Array.from(
      container.querySelectorAll<HTMLElement>('[data-testid="pip"]')
    );
    expect(
      pips.every((pip) => pip.style.backgroundColor === 'rgb(9, 9, 9)')
    ).toBe(true);
  });
});

describe('DoubleEighteen high-value doubles', () => {
  it('renders 17 and 18 doubles with the correct pip counts', () => {
    for (const value of [17, 18]) {
      const { container } = render(
        <DoubleEighteen value1={value} value2={value} />
      );
      expect(countPips(container)).toBe(value * 2);
    }
  });
});
