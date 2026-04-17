import type { Page } from '@playwright/test';

const launchDarklyGoals = '**/sdk/goals/**';
const launchDarklyEvalx = '**/sdk/evalx/**';
const launchDarklyStream = '**/eval/**';

const flagData = {
  releaseOnramperBuy: {
    flagVersion: 7,
    trackEvents: false,
    value: true,
    variation: 0,
    version: 8,
  },
  releaseTrendingTokens: {
    flagVersion: 1,
    trackEvents: false,
    value: true,
    variation: 0,
    version: 1,
  },
  isOrdinalsActive: {
    flagVersion: 1,
    trackEvents: false,
    value: true,
    variation: 0,
    version: 1,
  },
};

export async function mockLaunchDarkly(page: Page) {
  await page.route(launchDarklyGoals, route =>
    route.fulfill({
      json: [],
    })
  );
  await page.route(launchDarklyEvalx, route =>
    route.fulfill({
      json: flagData,
    })
  );
  await page.route(launchDarklyStream, route =>
    route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: ['event: put', `data: ${JSON.stringify(flagData)}`, '', ''].join('\n'),
    })
  );
}
