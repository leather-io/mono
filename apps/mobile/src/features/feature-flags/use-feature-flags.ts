import { useBoolVariation } from '@launchdarkly/react-native-client-sdk';

export function useReleasePushNotificationsFlag() {
  return useBoolVariation('release_push_notifications', false);
}

export function useReleaseBrowserFeatureFlag() {
  return useBoolVariation('release_browser_feature', false);
}

export function useReleaseLocaleFeatureFlag() {
  return useBoolVariation('release_locale_feature', false);
}

export function useNewRecipientFlowFeatureFlag() {
  return useBoolVariation('advanced_recipient_field', false);
}
