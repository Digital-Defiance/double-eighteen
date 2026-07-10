const { test, expect } = require('@playwright/test');
const {
  CHICKEN_FOOT_FIXTURE_IDS,
  OFFSET_ONLY_TRAIN_FIXTURE_IDS,
  TRAIN_FIXTURE_IDS,
} = require('./helpers.cjs');

for (const layoutStyle of ['offset', 'linear']) {
  test.describe(`train harness (${layoutStyle})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/harness/trains?layout=${layoutStyle}`);
      await expect(page.getByTestId('train-harness')).toBeVisible();
      await expect(page.getByTestId('train-harness-layout')).toHaveAttribute(
        'data-layout-style',
        layoutStyle
      );
    });

    const fixtureIds =
      layoutStyle === 'offset'
        ? TRAIN_FIXTURE_IDS
        : TRAIN_FIXTURE_IDS.filter(
            (id) => !OFFSET_ONLY_TRAIN_FIXTURE_IDS.includes(id)
          );

    for (const fixtureId of fixtureIds) {
      test(`fixture ${fixtureId} passes layout validation`, async ({ page }) => {
        const section = page.getByTestId(`train-fixture-${fixtureId}`);
        await expect(section).toBeVisible();
        await expect(section).toHaveAttribute('data-valid', 'true');
        await expect(
          page.getByTestId(`train-fixture-status-${fixtureId}`)
        ).toContainText('passed');

        const dominoes = section.locator('[data-testid^="train-domino-"]');
        const count = await dominoes.count();
        expect(count).toBeGreaterThan(0);

        for (let index = 0; index < count; index++) {
          const domino = dominoes.nth(index);
          await expect(domino).toHaveAttribute('data-index', String(index));
          await expect(domino).toHaveAttribute('data-value1', /.+/);
          await expect(domino).toHaveAttribute('data-value2', /.+/);
        }
      });
    }
  });
}
