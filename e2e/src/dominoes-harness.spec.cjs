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

    test('second half of every double is rotated 180°', async ({ page }) => {
      const tile = page.getByTestId(`double-${Math.min(6, setSize)}`);
      const half1 = tile.locator('[data-testid="domino-half"][data-half="1"]');
      const half2 = tile.locator('[data-testid="domino-half"][data-half="2"]');

      await expect(half1).toHaveAttribute('data-rotated', 'false');
      await expect(half2).toHaveAttribute('data-rotated', 'true');
      // rotate(180deg) → matrix(-1, 0, 0, -1, tx, ty)
      await expect(half2).toHaveCSS(
        'transform',
        /matrix\(-1,\s*0,\s*0,\s*-1/
      );
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

test.describe('domino harness half orientation', () => {
  test('asymmetric doubles expose half-orientation fixtures', async ({
    page,
  }) => {
    await page.goto('/harness/dominoes?set=18');

    for (const value of [13, 14, 15]) {
      const tile = page.getByTestId(`half-orient-double-${value}`);
      await expect(tile).toBeVisible();

      const half1 = tile.locator('[data-testid="domino-half"][data-half="1"]');
      const half2 = tile.locator('[data-testid="domino-half"][data-half="2"]');
      await expect(half1).toHaveAttribute('data-rotated', 'false');
      await expect(half2).toHaveAttribute('data-rotated', 'true');
      await expect(half2).toHaveCSS(
        'transform',
        /matrix\(-1,\s*0,\s*0,\s*-1/
      );
    }
  });

  test('remainder pips sit at both outer ends of an asymmetric double', async ({
    page,
  }) => {
    await page.goto('/harness/dominoes?set=15');
    const tile = page.getByTestId('half-orient-double-13');
    const half1 = tile.locator('[data-testid="domino-half"][data-half="1"]');
    const half2 = tile.locator('[data-testid="domino-half"][data-half="2"]');

    // Value 13 has a single remainder pip at data-row=0.
    const rem1 = half1.locator('[data-testid="pip"][data-row="0"]');
    const rem2 = half2.locator('[data-testid="pip"][data-row="0"]');
    await expect(rem1).toHaveCount(1);
    await expect(rem2).toHaveCount(1);

    const half1Box = await half1.boundingBox();
    const half2Box = await half2.boundingBox();
    const rem1Box = await rem1.boundingBox();
    const rem2Box = await rem2.boundingBox();
    expect(half1Box).toBeTruthy();
    expect(half2Box).toBeTruthy();
    expect(rem1Box).toBeTruthy();
    expect(rem2Box).toBeTruthy();

    // Half 1: remainder near the outer (top) end of the half.
    const rem1FromTop = rem1Box.y + rem1Box.height / 2 - half1Box.y;
    expect(rem1FromTop).toBeLessThan(half1Box.height / 2);

    // Half 2 is rotated 180°, so its data-row=0 remainder appears near the
    // outer (bottom) end of that half — away from the divider.
    const rem2FromTop = rem2Box.y + rem2Box.height / 2 - half2Box.y;
    expect(rem2FromTop).toBeGreaterThan(half2Box.height / 2);
  });

  test('set=12 has no asymmetric half-orientation fixtures', async ({
    page,
  }) => {
    await page.goto('/harness/dominoes?set=12');
    await expect(page.getByTestId('half-orient-double-13')).toHaveCount(0);
  });
});
