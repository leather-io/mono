import { getDeviceId } from '@/utils/get-device-id';
import {
  AutoEnvAttributes,
  ReactNativeLDClient,
  useBoolVariation,
  useStringVariation,
} from '@launchdarkly/react-native-client-sdk';
import * as Application from 'expo-application';

export const featureFlagClient = new ReactNativeLDClient(
  // TODO: do not fallback to empty string
  process.env.EXPO_PUBLIC_LAUNCH_DARKLY ?? '',
  AutoEnvAttributes.Enabled,
  {
    debug: false,
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
  featureFlagClient.identify({ kind: 'user', key: deviceId }).catch((e: unknown) => {
    // TODO: analytics?
    // eslint-disable-next-line no-console
    console.log(e);
  });
}

export function useWaitlistFlag() {
  return useBoolVariation('release_waitlist_features', false);
}

// Setting an empty string will not enforce a minimum version and will skip the check.
export function useMinimumAppVersion() {
  return useStringVariation('minimum_app_version', '');
}

export function useSwapSbtcBridgingFlag() {
  return useBoolVariation('swap_sbtc_bridging', false);
}
