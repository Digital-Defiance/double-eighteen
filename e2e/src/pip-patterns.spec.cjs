const { test, expect } = require('@playwright/test');
const { SET_SIZES } = require('./helpers.cjs');

for (const setSize of SET_SIZES) {
  test.describe(`pip pattern harness (double-${setSize})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/harness/pips?set=${setSize}`);
      await expect(page.getByTestId('pip-harness')).toBeVisible();
      await expect(page.getByTestId('pip-harness')).toHaveAttribute(
        'data-set',
        String(setSize)
      );
    });

    test(`renders all values 0 through ${setSize}`, async ({ page }) => {
      for (let value = 0; value <= setSize; value++) {
        await expect(page.getByTestId(`pip-value-${value}`)).toBeVisible();
      }
      await expect(page.getByTestId(`pip-value-${setSize + 1}`)).toHaveCount(0);
    });

    test('?color=true enables pip colors', async ({ page }) => {
      await page.goto(`/harness/pips?set=${setSize}&color=true`);
      await expect(page.getByTestId('pip-harness')).toHaveAttribute(
        'data-colors-enabled',
        'true'
      );
      await expect(page.getByRole('link', { name: 'Disable pip colors' })).toBeVisible();

      const tile = page.getByTestId('pip-value-2');
      const pip = tile.getByTestId('pip').first();
      await expect(pip).toHaveCSS('background-color', 'rgb(139, 26, 26)');
    });

    for (let value = 0; value <= setSize; value++) {
      test(`value ${value} renders ${value} pips`, async ({ page }) => {
        const tile = page.getByTestId(`pip-value-${value}`);
        await expect(tile.getByTestId('pip')).toHaveCount(value);
      });

      test(`value ${value} pips expose grid metadata`, async ({ page }) => {
        const tile = page.getByTestId(`pip-value-${value}`);
        const pips = tile.getByTestId('pip');
        await expect(pips).toHaveCount(value);

        for (let index = 0; index < value; index++) {
          const pip = pips.nth(index);
          await expect(pip).toHaveAttribute('data-row', /.+/);
          await expect(pip).toHaveAttribute('data-col', /.+/);
          await expect(pip).toHaveAttribute('data-grid', /.+/);
        }
      });
    }
  });
}

test.describe('set picker', () => {
  test('switches between set sizes', async ({ page }) => {
    await page.goto('/harness/pips?set=12');
    await page.getByTestId('set-picker-18').click();
    await expect(page.getByTestId('pip-harness')).toHaveAttribute('data-set', '18');
    await expect(page.getByTestId('pip-value-18')).toBeVisible();
  });
});
