import { test, expect } from '@playwright/test';
import { CHICKEN_FOOT_FIXTURES } from '../../src/harness/trainFixtures';

for (const layoutStyle of ['offset', 'linear'] as const) {
  test.describe(`chicken foot harness (${layoutStyle})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/harness/chicken-foot?layout=${layoutStyle}`);
      await expect(page.getByTestId('chicken-foot-harness')).toBeVisible();
      await expect(
        page.getByTestId('chicken-foot-harness-layout')
      ).toHaveAttribute('data-layout-style', layoutStyle);
    });

    const fixtures = CHICKEN_FOOT_FIXTURES.filter((fixture) =>
      fixture.layoutStyles.includes(layoutStyle)
    );

    for (const fixture of fixtures) {
      test(`fixture ${fixture.id} passes tree validation`, async ({ page }) => {
        const section = page.getByTestId(`chicken-foot-fixture-${fixture.id}`);
        await expect(section).toBeVisible();
        await expect(section).toHaveAttribute('data-valid', 'true');
        await expect(
          page.getByTestId(`chicken-foot-status-${fixture.id}`)
        ).toContainText('passed');
      });
    }
  });
}
