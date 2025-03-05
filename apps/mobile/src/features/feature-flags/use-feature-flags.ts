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
