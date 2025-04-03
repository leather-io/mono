import { useBoolVariation } from '@launchdarkly/react-native-client-sdk';

import { featureFlagKeys } from './feature-flag';

export function useReleasePushNotificationsFlag() {
  const releasePushNotifications = useBoolVariation(
    featureFlagKeys.releasePushNotifications.key,
    featureFlagKeys.releasePushNotifications.defaultValue
  );

  return releasePushNotifications;
}

export function useReleaseBrowserFeatureFlag() {
  const releaseBrowserFeature = useBoolVariation(
    featureFlagKeys.releaseBrowserFeature.key,
    featureFlagKeys.releaseBrowserFeature.defaultValue
  );

  return releaseBrowserFeature;
}

export function useReleaseLocaleFeatureFlag() {
  const releaseLocaleFeature = useBoolVariation(
    featureFlagKeys.releaseLocaleFeature.key,
    featureFlagKeys.releaseLocaleFeature.defaultValue
  );

  return releaseLocaleFeature;
}

export function useReleaseNotificationsFeatureFlag() {
  const releaseNotificationsFeature = useBoolVariation(
    featureFlagKeys.releaseNotificationsFeature.key,
    featureFlagKeys.releaseNotificationsFeature.defaultValue
  );

  return releaseNotificationsFeature;
}
