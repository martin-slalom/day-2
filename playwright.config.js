const { defineConfig, devices } = require('@playwright/test');

const frontendPort = process.env.PORT || 3000;

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  fullyParallel: false,
  retries: 1,
  use: {
    baseURL: process.env.E2E_BASE_URL || `http://localhost:${frontendPort}`,
    headless: true,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
