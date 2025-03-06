export interface DominoFixture {
  id: string;
  label: string;
  value1: number;
  value2: number;
  rotation?: number;
}

export const DOUBLE_FIXTURES: DominoFixture[] = Array.from(
  { length: 13 },
  (_, value) => ({
    id: `double-${value}`,
    label: `${value}|${value}`,
    value1: value,
    value2: value,
  })
);

export const MIXED_FIXTURES: DominoFixture[] = [
  { id: '12-0', label: '12|0', value1: 12, value2: 0 },
  { id: '11-3', label: '11|3', value1: 11, value2: 3 },
  { id: '10-5', label: '10|5', value1: 10, value2: 5 },
  { id: '9-7', label: '9|7', value1: 9, value2: 7 },
  { id: '8-2', label: '8|2', value1: 8, value2: 2 },
  { id: '6-4', label: '6|4', value1: 6, value2: 4 },
  { id: '5-1', label: '5|1', value1: 5, value2: 1 },
];

export const ROTATION_FIXTURES: DominoFixture[] = [0, 90, 180, 270].map(
  (rotation) => ({
    id: `rotation-${rotation}`,
    label: `6|9 @ ${rotation}°`,
    value1: 6,
    value2: 9,
    rotation,
  })
);
