import { test, expect } from '@playwright/test';
import { orientDominoValues } from '../../src/app/trainLayout';
import { TRAIN_FIXTURES } from '../../src/harness/trainFixtures';

for (const layoutStyle of ['offset', 'linear'] as const) {
  test.describe(`train harness (${layoutStyle})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/harness/trains?layout=${layoutStyle}`);
      await expect(page.getByTestId('train-harness')).toBeVisible();
      await expect(page.getByTestId('train-harness-layout')).toHaveAttribute(
        'data-layout-style',
        layoutStyle
      );
    });

    const fixtures = TRAIN_FIXTURES.filter((fixture) =>
      fixture.layoutStyles.includes(layoutStyle)
    );

    for (const fixture of fixtures) {
      test(`fixture ${fixture.id} passes layout validation`, async ({ page }) => {
        const section = page.getByTestId(`train-fixture-${fixture.id}`);
        await expect(section).toBeVisible();
        await expect(section).toHaveAttribute('data-valid', 'true');
        await expect(
          page.getByTestId(`train-fixture-status-${fixture.id}`)
        ).toContainText('passed');

        const orientedDominoes = orientDominoValues(
          fixture.dominoes,
          layoutStyle
        );

        for (let index = 0; index < orientedDominoes.length; index++) {
          const domino = page.getByTestId(`train-domino-${fixture.id}-${index}`);
          await expect(domino).toBeVisible();
          await expect(domino).toHaveAttribute('data-index', String(index));
          await expect(domino).toHaveAttribute(
            'data-value1',
            String(orientedDominoes[index].value1)
          );
          await expect(domino).toHaveAttribute(
            'data-value2',
            String(orientedDominoes[index].value2)
          );
        }
      });
    }
  });
}
