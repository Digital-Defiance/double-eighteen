import { test, expect } from '@playwright/test';

test.describe('harness index', () => {
  test('lists all validation harnesses', async ({ page }) => {
    await page.goto('/harness');
    await expect(page.getByTestId('harness-index')).toBeVisible();
    await expect(page.getByTestId('harness-link-pips')).toBeVisible();
    await expect(page.getByTestId('harness-link-dominoes')).toBeVisible();
    await expect(page.getByTestId('harness-link-trains')).toBeVisible();
    await expect(page.getByTestId('harness-link-chicken-foot')).toBeVisible();
  });
});
