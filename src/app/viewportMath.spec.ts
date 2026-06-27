import {
  clampScale,
  fitToBounds,
  screenToContent,
  zoomAt,
} from './viewportMath';

describe('clampScale', () => {
  it('clamps to the range', () => {
    expect(clampScale(0.1, 0.2, 4)).toBe(0.2);
    expect(clampScale(10, 0.2, 4)).toBe(4);
    expect(clampScale(1, 0.2, 4)).toBe(1);
  });
});

describe('zoomAt', () => {
  it('keeps the content point under the pivot fixed', () => {
    const view = { scale: 1, x: 0, y: 0 };
    const pivot = { x: 100, y: 50 };
    const before = screenToContent(view, pivot);
    const after = zoomAt(view, 2, pivot, 0.2, 4);
    const afterContent = screenToContent(after, pivot);
    expect(after.scale).toBe(2);
    expect(afterContent.x).toBeCloseTo(before.x, 6);
    expect(afterContent.y).toBeCloseTo(before.y, 6);
  });

  it('does not drift translation once scale is clamped at the max', () => {
    const view = { scale: 4, x: 10, y: 20 };
    const next = zoomAt(view, 2, { x: 100, y: 100 }, 0.2, 4);
    expect(next.scale).toBe(4);
    // effective factor is 1 → translation unchanged.
    expect(next.x).toBeCloseTo(10, 6);
    expect(next.y).toBeCloseTo(20, 6);
  });
});

describe('fitToBounds', () => {
  it('centers content and scales it to fit within padding', () => {
    const t = fitToBounds({ width: 200, height: 100 }, { width: 440, height: 240 }, 20, 0.2, 4);
    // width fit = (440-40)/200 = 2; height fit = (240-40)/100 = 2 → scale 2.
    expect(t.scale).toBe(2);
    // centered: x = (440 - 200*2)/2 = 20, y = (240 - 100*2)/2 = 20.
    expect(t.x).toBeCloseTo(20, 6);
    expect(t.y).toBeCloseTo(20, 6);
  });

  it('never exceeds the max scale for tiny content', () => {
    const t = fitToBounds({ width: 10, height: 10 }, { width: 1000, height: 1000 }, 20, 0.2, 4);
    expect(t.scale).toBe(4);
  });
});
