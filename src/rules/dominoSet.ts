import { DominoValue } from '@/game/DominoValue';

/**
 * Canonical, order-independent key for a tile. `6-3` and `3-6` are the same
 * physical domino, so they share a key. Used to enforce tile uniqueness.
 */
export function tileKey(value1: number, value2: number): string {
  return value1 <= value2 ? `${value1}:${value2}` : `${value2}:${value1}`;
}

export function dominoKey(tile: DominoValue): string {
  return tileKey(tile.value1, tile.value2);
}

export function isDouble(tile: DominoValue): boolean {
  return tile.value1 === tile.value2;
}

export function tileHasValue(tile: DominoValue, value: number): boolean {
  return tile.value1 === value || tile.value2 === value;
}

/** The pip value on the opposite end from `value`, or null if it doesn't touch. */
export function otherEnd(tile: DominoValue, value: number): number | null {
  if (tile.value1 === value) return tile.value2;
  if (tile.value2 === value) return tile.value1;
  return null;
}

/**
 * Orients a tile so its `value1` is the end that connects to `connectingValue`.
 * Returns null if the tile has no such end.
 */
export function orientForConnection(
  tile: DominoValue,
  connectingValue: number
): DominoValue | null {
  if (tile.value1 === connectingValue) {
    return { value1: tile.value1, value2: tile.value2 };
  }
  if (tile.value2 === connectingValue) {
    return { value1: tile.value2, value2: tile.value1 };
  }
  return null;
}

/** Every unique tile in a double-`maxPips` set (e.g. maxPips=12 → 91 tiles). */
export function generateDominoSet(maxPips: number): DominoValue[] {
  const tiles: DominoValue[] = [];
  for (let a = 0; a <= maxPips; a++) {
    for (let b = a; b <= maxPips; b++) {
      tiles.push({ value1: a, value2: b });
    }
  }
  return tiles;
}

/** Count of tiles in a double-`maxPips` set: (n+1)(n+2)/2 where n = maxPips. */
export function dominoSetSize(maxPips: number): number {
  const n = maxPips + 1;
  return (n * (n + 1)) / 2;
}
