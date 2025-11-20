import { getDeviceId } from '@/utils/get-device-id';
import {
  AutoEnvAttributes,
  ReactNativeLDClient,
  useBoolVariation,
  useStringVariation,
} from '@launchdarkly/react-native-client-sdk';
import * as Application from 'expo-application';

import { launchDarklyFlagKeys } from '@leather.io/models';

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
  featureFlagClient.identify({ kind: 'user', key: deviceId }).catch((e: any) => {
    // TODO: analytics?
    // eslint-disable-next-line no-console
    console.log(e);
  });
}
export function useBrowserFlag() {
  return useBoolVariation(launchDarklyFlagKeys.releaseBrowserFeature, false);
}

export function useCollectiblesFlag() {
  return useBoolVariation(launchDarklyFlagKeys.releaseCollectiblesFeature, false);
}
export function useCollectibleDetailsFlag() {
  return useBoolVariation(launchDarklyFlagKeys.collectibleDetails, false);
}

export function useNotificationsFlag() {
  return useBoolVariation(launchDarklyFlagKeys.releasePushNotifications, false);
}

export function useWaitlistFlag() {
  return useBoolVariation(launchDarklyFlagKeys.releaseWaitlistFeatures, false);
}

export function useDynamicFeeFlag() {
  return useBoolVariation(launchDarklyFlagKeys.releaseDynamicFeeFeature, false);
}

export function useEarnFlag() {
  return useBoolVariation(launchDarklyFlagKeys.releaseEarnFeature, false);
}

export function useDappSuggestions() {
  return useBoolVariation(launchDarklyFlagKeys.releaseDappSuggestionsFeature, false);
}

export function useSip10SendFlag() {
  return useBoolVariation(launchDarklyFlagKeys.releaseSip10SendFeature, false);
}

export function useSendPasteButton() {
  return useBoolVariation(launchDarklyFlagKeys.sendPasteButton, false);
}

export function useTokenDetailsFlag() {
  return useBoolVariation(launchDarklyFlagKeys.tokenDetails, false);
}

// Setting an empty string will not enforce a minimum version and will skip the check.
export function useMinimumAppVersion() {
  return useStringVariation(launchDarklyFlagKeys.minimumAppVersion, '');
}

export function useBtcConversionUnitFlag() {
  return useBoolVariation(launchDarklyFlagKeys.releaseBtcConversionUnitFeature, false);
}

export function useInternationalizationFlag() {
  return useBoolVariation(launchDarklyFlagKeys.internationalization, false);
}

export function useTokenManagementFlag() {
  return useBoolVariation(launchDarklyFlagKeys.releaseTokenManagement, false);
}

export function useSwapFlag() {
  return useBoolVariation(launchDarklyFlagKeys.swap, false);
}

export function useOnramperBuyFlag() {
  return useBoolVariation(launchDarklyFlagKeys.releaseOnramperBuy, false);
}

export function useOnramperSellFlag() {
  return useBoolVariation(launchDarklyFlagKeys.releaseOnramperSell, false);
}
