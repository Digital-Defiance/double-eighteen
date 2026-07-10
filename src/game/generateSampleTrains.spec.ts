import { generateSampleTrains, tileKey } from './generateSampleTrains';
import { computeTrainTree } from '@/app/trainLayout';
import {
  validateChickenFootChain,
  validateTrainTree,
} from '@/harness/layoutValidation';

const ENGINE_VALUES = [9, 12, 15, 18] as const;

describe.each(ENGINE_VALUES)('generateSampleTrains (double-%i)', (engineValue) => {
  it('never places the engine double as the first train domino', () => {
    for (let run = 0; run < 20; run++) {
      const trains = generateSampleTrains(8, engineValue);
      for (const train of trains) {
        const first = train.dominoes[0];
        if (first) {
          expect(first).not.toEqual({ value1: engineValue, value2: engineValue });
        }
      }
    }
  });

  it('never places consecutive doubles on a train', () => {
    for (let run = 0; run < 20; run++) {
      const trains = generateSampleTrains(8, engineValue);
      for (const train of trains) {
        for (let i = 1; i < train.dominoes.length; i++) {
          const prev = train.dominoes[i - 1];
          const current = train.dominoes[i];
          const prevIsDouble = prev.value1 === prev.value2;
          const currentIsDouble = current.value1 === current.value2;
          expect(prevIsDouble && currentIsDouble).toBe(false);
        }
      }
    }
  });

  it('uses each tile at most once across all trains', () => {
    for (let run = 0; run < 20; run++) {
      const trains = generateSampleTrains(8, engineValue);
      const seen = new Set<string>([tileKey(engineValue, engineValue)]);

      for (const train of trains) {
        for (const domino of train.dominoes) {
          expect(domino.value1).toBeLessThanOrEqual(engineValue);
          expect(domino.value2).toBeLessThanOrEqual(engineValue);
          const key = tileKey(domino.value1, domino.value2);
          expect(seen.has(key)).toBe(false);
          seen.add(key);
        }
      }
    }
  });

  it('only attaches chicken feet to doubles when enabled', () => {
    const plain = generateSampleTrains(8, engineValue);
    expect(plain.every((train) => train.feet === undefined)).toBe(true);

    for (let run = 0; run < 20; run++) {
      const trains = generateSampleTrains(8, engineValue, { chickenFeet: true });
      for (const train of trains) {
        for (const key of Object.keys(train.feet ?? {})) {
          const host = train.dominoes[Number(key)];
          expect(host.value1).toBe(host.value2);
        }
      }
    }
  });

  it('produces chicken-foot trees that pass validation', () => {
    for (let run = 0; run < 20; run++) {
      const trains = generateSampleTrains(6, engineValue, { chickenFeet: true });
      for (const train of trains) {
        const branch = { dominoes: train.dominoes, feet: train.feet };
        expect(validateChickenFootChain(branch).issues).toEqual([]);

        const segments = computeTrainTree({
          startX: 300,
          startY: 300,
          angle: 0,
          branch,
          layoutStyle: 'offset',
        });
        expect(validateTrainTree(segments).issues).toEqual([]);
      }
    }
  });
});
