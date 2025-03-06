import { test, expect } from '@playwright/test';
import {
  DOUBLE_FIXTURES,
  MIXED_FIXTURES,
  ROTATION_FIXTURES,
} from '../../src/harness/dominoFixtures';

test.describe('domino harness', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness/dominoes');
    await expect(page.getByTestId('domino-harness')).toBeVisible();
  });

  test('renders all double fixtures', async ({ page }) => {
    for (const fixture of DOUBLE_FIXTURES) {
      const tile = page.getByTestId(fixture.id);
      await expect(tile).toBeVisible();
      await expect(tile).toHaveAttribute('data-value1', String(fixture.value1));
      await expect(tile).toHaveAttribute('data-value2', String(fixture.value2));
      await expect(tile.getByTestId('pip')).toHaveCount(fixture.value1 * 2);
    }
  });

  test('renders mixed and rotation fixtures', async ({ page }) => {
    for (const fixture of [...MIXED_FIXTURES, ...ROTATION_FIXTURES]) {
      await expect(page.getByTestId(fixture.id)).toBeVisible();
    }
  });

  test('?color=true applies pip colors', async ({ page }) => {
    await page.goto('/harness/dominoes?color=true');
    const tile = page.getByTestId('double-2');
    const pip = tile.getByTestId('pip').first();
    await expect(pip).toHaveCSS('background-color', 'rgb(139, 26, 26)');
  });
});
