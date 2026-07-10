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

export function parseSetParam(raw: string | null): DominoSetSize {
  const parsed = raw ? Number(raw) : NaN;
  return normalizeSetSize(Number.isFinite(parsed) ? parsed : undefined);
}
