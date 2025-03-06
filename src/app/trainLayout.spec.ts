import {
  computeTrainLayout,
  stepAlongTrain,
} from '@/app/trainLayout';
import { TRAIN_FIXTURES } from '@/harness/trainFixtures';
import { validateTrainLayout } from '@/harness/layoutValidation';

describe('trainLayout', () => {
  it('uses expected spacing constants', () => {
    expect(stepAlongTrain(false, false)).toBe(120);
    expect(stepAlongTrain(true, false)).toBe(90);
    expect(stepAlongTrain(false, true)).toBe(90);
    expect(stepAlongTrain(true, true)).toBe(60);
  });

  it.each(TRAIN_FIXTURES.flatMap((fixture) =>
    fixture.layoutStyles.map((layoutStyle) => [fixture.id, layoutStyle, fixture] as const)
  ))(
    'fixture %s passes validation in %s layout',
    (_id, layoutStyle, fixture) => {
      const layout = computeTrainLayout({
        startX: 80,
        startY: 110,
        angle: fixture.angle,
        dominoes: fixture.dominoes,
        layoutStyle,
      });

      const result = validateTrainLayout(
        layout,
        fixture.dominoes,
        fixture.angle,
        layoutStyle
      );

      expect(result.issues).toEqual([]);
      expect(result.valid).toBe(true);
    }
  );
});
