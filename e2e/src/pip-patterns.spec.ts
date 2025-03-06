import { test, expect } from '@playwright/test';
import { getPipLayout } from '../../src/app/pipLayouts';

test.describe('pip pattern harness', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness/pips');
    await expect(page.getByTestId('pip-harness')).toBeVisible();
  });

  test('renders all values 0 through 12', async ({ page }) => {
    for (let value = 0; value <= 12; value++) {
      await expect(page.getByTestId(`pip-value-${value}`)).toBeVisible();
    }
  });

  test('?color=true enables pip colors', async ({ page }) => {
    await page.goto('/harness/pips?color=true');
    await expect(page.getByTestId('pip-harness')).toHaveAttribute(
      'data-colors-enabled',
      'true'
    );
    await expect(page.getByRole('link', { name: 'Disable pip colors' })).toBeVisible();

    const tile = page.getByTestId('pip-value-2');
    const pip = tile.getByTestId('pip').first();
    await expect(pip).toHaveCSS('background-color', 'rgb(139, 26, 26)');
  });

  for (let value = 0; value <= 12; value++) {
    test(`value ${value} renders ${value} pips`, async ({ page }) => {
      const tile = page.getByTestId(`pip-value-${value}`);
      await expect(tile.getByTestId('pip')).toHaveCount(value);
    });

    test(`value ${value} pip grid positions match layout spec`, async ({
      page,
    }) => {
      const tile = page.getByTestId(`pip-value-${value}`);
      const layout = getPipLayout(value);
      const pips = tile.getByTestId('pip');
      await expect(pips).toHaveCount(layout.length);

      for (let index = 0; index < layout.length; index++) {
        const cell = layout[index];
        const pip = pips.nth(index);

        await expect(pip).toHaveAttribute('data-row', String(cell.row));
        await expect(pip).toHaveAttribute('data-col', String(cell.col));
        await expect(pip).toHaveAttribute('data-grid', cell.gridSize);
      }
    });
  }
});
