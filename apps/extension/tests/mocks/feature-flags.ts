import type { Page } from '@playwright/test';

const launchDarklyGoals = 'https://app.launchdarkly.com/sdk/goals*';
const launchDarklyEvalx = 'https://app.launchdarkly.com/sdk/evalx*';

export interface FeatureFlagOptions {
  extensionRevamp?: boolean;
  releaseOnramperBuy?: boolean;
  releaseOnramperSell?: boolean;
}

const defaultFlags: Required<FeatureFlagOptions> = {
  extensionRevamp: true,
  releaseOnramperBuy: true,
  releaseOnramperSell: true,
};

export async function mockFeatureFlags(page: Page, options: FeatureFlagOptions = {}) {
  const flags = { ...defaultFlags, ...options };

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
          value: flags.extensionRevamp,
          variation: flags.extensionRevamp ? 0 : 1,
          version: 8,
        },
        releaseOnramperBuy: {
          flagVersion: 7,
          trackEvents: false,
          value: flags.releaseOnramperBuy,
          variation: flags.releaseOnramperBuy ? 0 : 1,
          version: 8,
        },
        releaseOnramperSell: {
          flagVersion: 7,
          trackEvents: false,
          value: flags.releaseOnramperSell,
          variation: flags.releaseOnramperSell ? 0 : 1,
          version: 8,
        },
      },
    })
  );
}

export { mockFeatureFlags as mockLaunchDarkly };
