import type { BrowserContext, Page } from '@playwright/test';

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
};

export async function mockLaunchDarkly(page: Page | BrowserContext) {
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

function makeFlag(value: boolean) {
  return { flagVersion: 1, trackEvents: false, value, variation: value ? 0 : 1, version: 1 };
}

// Layers additional flags on top of the defaults for a single spec. Register it
// after `setupAndUseApiCalls` so it takes precedence over `mockLaunchDarkly`, and
// route the context (not just the page) so the overrides also reach RPC popups,
// where flags like `releaseAddAccount` gate the approval UI.
export async function overrideLaunchDarklyFlags(
  target: Page | BrowserContext,
  overrides: Record<string, boolean>
) {
  const data = {
    ...flagData,
    ...Object.fromEntries(Object.entries(overrides).map(([key, value]) => [key, makeFlag(value)])),
  };
  await target.route(launchDarklyEvalx, route => route.fulfill({ json: data }));
  await target.route(launchDarklyStream, route =>
    route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: ['event: put', `data: ${JSON.stringify(data)}`, '', ''].join('\n'),
    })
  );
}
