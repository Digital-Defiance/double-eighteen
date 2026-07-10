const { defineConfig, devices } = require('@playwright/test');
const path = require('node:path');

const workspaceRoot = path.resolve(__dirname, '..');

module.exports = defineConfig({
  testDir: './src',
  testMatch: '**/*.spec.cjs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:4300',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'yarn nx run double-eighteen:preview',
    url: 'http://localhost:4300',
    reuseExistingServer: !process.env.CI,
    cwd: workspaceRoot,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
