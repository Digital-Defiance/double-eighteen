import { describe, expect, it } from 'vitest';
import {
  centerHalfExtentAlongEnd,
  computeLineLayout,
  DOMINO_HEIGHT,
  DOMINO_WIDTH,
} from './lineLayout';
import { halfExtentAlongTrain } from './trainLayout';

describe('computeLineLayout', () => {
  it('abuts the first arm tile against a vertical spinner on the right', () => {
    const center = { value1: 6, value2: 6 };
    const layout = computeLineLayout({
      centerX: 400,
      centerY: 400,
      center,
      arms: [{ end: 'right', dominoes: [{ value1: 6, value2: 0 }] }],
    });
    const arm = layout.arms[0]!;
    expect(arm.startX).toBe(400);
    expect(arm.startY).toBe(400);
    const firstCenterX = arm.startX + arm.leadGap;
    const nearEdge = firstCenterX - halfExtentAlongTrain(false);
    const spinnerRight = 400 + DOMINO_WIDTH / 2;
    expect(nearEdge).toBeCloseTo(spinnerRight, 5);
  });

  it('abuts a double first tile on the bottom of a spinner', () => {
    const center = { value1: 6, value2: 6 };
    const layout = computeLineLayout({
      centerX: 0,
      centerY: 0,
      center,
      arms: [{ end: 'bottom', dominoes: [{ value1: 5, value2: 5 }] }],
    });
    const arm = layout.arms[0]!;
    const firstCenterY = arm.startY + arm.leadGap;
    const nearEdge = firstCenterY - halfExtentAlongTrain(true);
    expect(nearEdge).toBeCloseTo(DOMINO_HEIGHT / 2, 5);
  });

  it('uses long-axis half-extent for a horizontal seed on left/right', () => {
    expect(
      centerHalfExtentAlongEnd('right', { value1: 3, value2: 5 })
    ).toBe(DOMINO_HEIGHT / 2);
    expect(
      centerHalfExtentAlongEnd('right', { value1: 6, value2: 6 })
    ).toBe(DOMINO_WIDTH / 2);
  });
});
