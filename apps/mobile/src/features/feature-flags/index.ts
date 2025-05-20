import { isProduction } from '@/shared/environment';
import { getDeviceId } from '@/utils/get-device-id';
import {
  AutoEnvAttributes,
  ReactNativeLDClient,
  useBoolVariation,
} from '@launchdarkly/react-native-client-sdk';
import * as Application from 'expo-application';

export const featureFlagClient = new ReactNativeLDClient(
  // TODO: do not fallback to empty string
  process.env.EXPO_PUBLIC_LAUNCH_DARKLY ?? '',
  AutoEnvAttributes.Enabled,
  {
    debug: !isProduction(),
    applicationInfo: {
      id: 'leather-mobile-wallet',
      version: Application.nativeApplicationVersion ?? '0.0.1',
    },
  }
);

export async function setupFeatureFlags() {
  const deviceId = await getDeviceId();
  if (!deviceId) {
    // TODO: handle this error properly
    throw new Error('No device id detected');
  }
  featureFlagClient.identify({ kind: 'user', key: deviceId }).catch((e: any) => {
    // TODO: analytics?
    // eslint-disable-next-line no-console
    console.log(e);
  });
}
export function useBrowserFlag() {
  return useBoolVariation('release_browser_feature', false);
}

export function useCollectiblesFlag() {
  return useBoolVariation('release_collectibles_feature', false);
}

export function useLocaleFlag() {
  return useBoolVariation('release_locale_feature', false);
}

export function useNotificationsFlag() {
  return useBoolVariation('release_push_notifications', false);
}

export function useRunesFlag() {
  return useBoolVariation('release_runes_feature', false);
}

export function useWaitlistFlag() {
  return useBoolVariation('release_waitlist_features', false);
}

export function useDynamicFeeFlag() {
  return useBoolVariation('release_dynamic_fee_feature', false);
}
export function useEarnFlag() {
  return useBoolVariation('release_earn_feature', true);
}
