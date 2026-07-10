const { test, expect } = require('@playwright/test');
const { CHICKEN_FOOT_FIXTURE_IDS } = require('./helpers.cjs');

for (const layoutStyle of ['offset', 'linear']) {
  test.describe(`chicken foot harness (${layoutStyle})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/harness/chicken-foot?layout=${layoutStyle}`);
      await expect(page.getByTestId('chicken-foot-harness')).toBeVisible();
      await expect(
        page.getByTestId('chicken-foot-harness-layout')
      ).toHaveAttribute('data-layout-style', layoutStyle);
    });

    for (const fixtureId of CHICKEN_FOOT_FIXTURE_IDS) {
      test(`fixture ${fixtureId} passes tree validation`, async ({ page }) => {
        const section = page.getByTestId(`chicken-foot-fixture-${fixtureId}`);
        await expect(section).toBeVisible();
        await expect(section).toHaveAttribute('data-valid', 'true');
        await expect(
          page.getByTestId(`chicken-foot-status-${fixtureId}`)
        ).toContainText('passed');
      });
    }
  });
}
