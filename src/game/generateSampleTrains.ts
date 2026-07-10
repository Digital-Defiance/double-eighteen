import { DominoValue } from './DominoValue';
import { TrainBranch, TrainData } from './TrainData';
import { tileKey } from '@/rules/dominoSet';

export { tileKey };

export interface GenerateSampleTrainsOptions {
  /** Attach chicken-foot side toes (±45°) to every double. */
  chickenFeet?: boolean;
}

/** Demo train generator that respects tile-uniqueness constraints for the set. */
export function generateSampleTrains(
  playerCount: number,
  engineValue = 18,
  options: GenerateSampleTrainsOptions = {}
): TrainData[] {
  const usedTiles = new Set<string>([tileKey(engineValue, engineValue)]);
  const trains: TrainData[] = [];

  for (let playerId = 0; playerId < playerCount; playerId++) {
    const dominoCount = 4 + Math.floor(Math.random() * 7);
    const dominoes: DominoValue[] = [];
    let openValue = engineValue;
    let prevWasDouble = false;

    for (let j = 0; j < dominoCount; j++) {
      const value2 = pickNextValue(
        openValue,
        prevWasDouble,
        j === 0,
        engineValue,
        usedTiles
      );

      // No tile left that keeps the chain legal and unique: stop this train.
      if (value2 === null) {
        break;
      }

      const isDouble = value2 === openValue;
      usedTiles.add(tileKey(openValue, value2));

      dominoes.push({ value1: openValue, value2 });
      prevWasDouble = isDouble;
      openValue = value2;
    }

    const feet = options.chickenFeet
      ? buildFeet(dominoes, usedTiles, engineValue)
      : undefined;

    trains.push({
      playerId,
      dominoes,
      isPublic: Math.random() > 0.7,
      ...(feet ? { feet } : {}),
    });
  }

  return trains;
}

/**
 * Builds chicken-foot side toes for every double in a chain. Each toe is a short
 * straight run (no doubles, so no nested feet) starting from the double's value.
 */
function buildFeet(
  dominoes: readonly DominoValue[],
  usedTiles: Set<string>,
  maxPips: number
): Record<number, TrainBranch[]> | undefined {
  const feet: Record<number, TrainBranch[]> = {};

  for (let i = 0; i < dominoes.length; i++) {
    if (dominoes[i].value1 !== dominoes[i].value2) {
      continue;
    }

    const doubleValue = dominoes[i].value1;
    const toes: TrainBranch[] = [];
    for (let t = 0; t < 2; t++) {
      const toe = buildToe(doubleValue, usedTiles, maxPips);
      if (toe) {
        toes.push(toe);
      }
    }

    if (toes.length) {
      feet[i] = toes;
    }
  }

  return Object.keys(feet).length ? feet : undefined;
}

function buildToe(
  startValue: number,
  usedTiles: Set<string>,
  maxPips: number
): TrainBranch | null {
  const length = 1 + Math.floor(Math.random() * 2);
  const dominoes: DominoValue[] = [];
  let openValue = startValue;

  for (let j = 0; j < length; j++) {
    const next = pickNonDouble(openValue, usedTiles, maxPips);
    if (next === null) {
      break;
    }
    usedTiles.add(tileKey(openValue, next));
    dominoes.push({ value1: openValue, value2: next });
    openValue = next;
  }

  return dominoes.length ? { dominoes } : null;
}

function pickNonDouble(
  openValue: number,
  usedTiles: Set<string>,
  maxPips: number
): number | null {
  const candidates: number[] = [];
  for (let value = 0; value <= maxPips; value++) {
    if (value === openValue) {
      continue;
    }
    if (usedTiles.has(tileKey(openValue, value))) {
      continue;
    }
    candidates.push(value);
  }

  if (candidates.length === 0) {
    return null;
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}

function pickNextValue(
  openValue: number,
  prevWasDouble: boolean,
  isFirstDomino: boolean,
  engineValue: number,
  usedTiles: Set<string>
): number | null {
  const candidates = Array.from({ length: engineValue + 1 }, (_, value) => value).filter(
    (value) =>
      isValidNextValue(
        openValue,
        value,
        prevWasDouble,
        isFirstDomino,
        engineValue,
        usedTiles
      )
  );

  if (candidates.length === 0) {
    return null;
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}

function isValidNextValue(
  openValue: number,
  value: number,
  prevWasDouble: boolean,
  isFirstDomino: boolean,
  engineValue: number,
  usedTiles: Set<string>
): boolean {
  const isDouble = value === openValue;

  if (isFirstDomino && isDouble && openValue === engineValue) {
    return false;
  }

  if (isDouble && prevWasDouble) {
    return false;
  }

  if (usedTiles.has(tileKey(openValue, value))) {
    return false;
  }

  return true;
}
