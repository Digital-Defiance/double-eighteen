const { test, expect } = require('@playwright/test');
const { doubleFixtures, SET_SIZES } = require('./helpers.cjs');

for (const setSize of SET_SIZES) {
  test.describe(`domino harness (double-${setSize})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/harness/dominoes?set=${setSize}`);
      await expect(page.getByTestId('domino-harness')).toBeVisible();
      await expect(page.getByTestId('domino-harness')).toHaveAttribute(
        'data-set',
        String(setSize)
      );
    });

    test('renders all double fixtures for the set', async ({ page }) => {
      for (const fixture of doubleFixtures(setSize)) {
        const tile = page.getByTestId(fixture.id);
        await expect(tile).toBeVisible();
        await expect(tile).toHaveAttribute('data-value1', String(fixture.value1));
        await expect(tile).toHaveAttribute('data-value2', String(fixture.value2));
        await expect(tile.getByTestId('pip')).toHaveCount(fixture.value1 * 2);
      }
      await expect(page.getByTestId(`double-${setSize + 1}`)).toHaveCount(0);
    });

    test('renders mixed and rotation fixtures', async ({ page }) => {
      await expect(page.getByTestId('rotation-0')).toBeVisible();
      await expect(page.getByTestId('rotation-90')).toBeVisible();
      await expect(page.getByTestId(`${setSize}-0`)).toBeVisible();
    });

    test('?color=true applies pip colors', async ({ page }) => {
      await page.goto(`/harness/dominoes?set=${setSize}&color=true`);
      const tile = page.getByTestId('double-2');
      const pip = tile.getByTestId('pip').first();
      await expect(pip).toHaveCSS('background-color', 'rgb(139, 26, 26)');
    });
  });
}

test.describe('domino harness high doubles', () => {
  test('double-17 and double-18 render the correct pip counts', async ({
    page,
  }) => {
    await page.goto('/harness/dominoes?set=18');
    await expect(page.getByTestId('double-17').getByTestId('pip')).toHaveCount(
      34
    );
    await expect(page.getByTestId('double-18').getByTestId('pip')).toHaveCount(
      36
    );
  });
});
