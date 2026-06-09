import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  workers: 2,
  expect: {
    timeout: 5000,
  },
  reporter: [['list'], ['html', { open: 'never' }], ['allure-playwright', { outputFolder: 'allure-results' }]],
  use: {
    headless: false,
    browserName: 'chromium',
    channel: 'chrome',
    actionTimeout: 0,
    trace: 'on-first-retry',
    viewport: null,
    launchOptions: {
      args: ['--start-maximized'],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        viewport: null,
        launchOptions: {
          args: ['--start-maximized'],
        },
      },
    },
  ],
});
