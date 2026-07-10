import type { DominoSetSize } from '../variants';
import { normalizeSetSize } from '../variants';

export interface DominoFixture {
  id: string;
  label: string;
  value1: number;
  value2: number;
  rotation?: number;
}

export function doubleFixtures(maxPips: number): DominoFixture[] {
  return Array.from({ length: maxPips + 1 }, (_, value) => ({
    id: `double-${value}`,
    label: `${value}|${value}`,
    value1: value,
    value2: value,
  }));
}

export const DOUBLE_FIXTURES = doubleFixtures(12);

export function mixedFixtures(maxPips: number): DominoFixture[] {
  const pairs: [number, number][] = [
    [maxPips, 0],
    [Math.max(0, maxPips - 1), 3],
    [Math.max(0, maxPips - 2), 5],
    [9, 7],
    [8, 2],
    [6, 4],
    [5, 1],
  ];
  return pairs
    .filter(([a, b]) => a <= maxPips && b <= maxPips)
    .map(([value1, value2]) => ({
      id: `${value1}-${value2}`,
      label: `${value1}|${value2}`,
      value1,
      value2,
    }));
}

export const MIXED_FIXTURES = mixedFixtures(12);

export const ROTATION_FIXTURES: DominoFixture[] = [0, 90, 180, 270].map(
  (rotation) => ({
    id: `rotation-${rotation}`,
    label: `6|9 @ ${rotation}°`,
    value1: 6,
    value2: 9,
    rotation,
  })
);

/**
 * Asymmetric faces (13–15) make the required 180° second-half rotation visible:
 * remainder pips sit on one side of the body only. Symmetric faces (0–12, 16–18)
 * look identical with or without the half rotation.
 */
export function halfOrientationFixtures(maxPips: number): DominoFixture[] {
  const asymmetric = [13, 14, 15].filter((value) => value <= maxPips);
  return asymmetric.flatMap((value) => [
    {
      id: `half-orient-double-${value}`,
      label: `${value}|${value} (half 180°)`,
      value1: value,
      value2: value,
    },
    {
      id: `half-orient-mixed-${value}`,
      label: `${value}|0 (half 180°)`,
      value1: value,
      value2: 0,
    },
  ]);
}

export function parseSetParam(raw: string | null): DominoSetSize {
  const parsed = raw ? Number(raw) : NaN;
  return normalizeSetSize(Number.isFinite(parsed) ? parsed : undefined);
}
