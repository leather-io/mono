export const launchDarklyFlagKeys = {
  releaseOnramperBuy: 'release_onramper_buy',
  extensionRevamp: 'extension_revamp',
} as const;

type LaunchDarklyFlagKey = keyof typeof launchDarklyFlagKeys;

export type FeatureFlags = Record<LaunchDarklyFlagKey, boolean>;

export const featureFlagDefaults: FeatureFlags = {
  releaseOnramperBuy: false,
  extensionRevamp: false,
};
