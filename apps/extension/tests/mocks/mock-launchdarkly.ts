import type { Page } from '@playwright/test';

const launchDarklyGoals = 'https://app.launchdarkly.com/sdk/goals*';
const launchDarklyEvalx = 'https://app.launchdarkly.com/sdk/evalx*';

export async function mockLaunchDarkly(page: Page) {
  await page.route(launchDarklyGoals, route =>
    route.fulfill({
      json: [],
    })
  );
  await page.route(launchDarklyEvalx, route =>
    route.fulfill({
      json: {
        extension_revamp: {
          flagVersion: 3,
          trackEvents: false,
          value: true,
          variation: 0,
          version: 8,
        },
        release_onramper_buy: {
          flagVersion: 7,
          trackEvents: false,
          value: true,
          variation: 0,
          version: 8,
        },
      },
    })
  );
}
