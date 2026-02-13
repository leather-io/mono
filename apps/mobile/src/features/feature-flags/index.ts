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
  featureFlagClient.identify({ kind: 'user', key: deviceId }).catch((e: any) => {
    // TODO: analytics?
    // eslint-disable-next-line no-console
    console.log(e);
  });
}
export function useBrowserFlag() {
  return useBoolVariation('release_browser_feature', false);
}

export function useNotificationsFlag() {
  return useBoolVariation('release_push_notifications', false);
}

export function useWaitlistFlag() {
  return useBoolVariation('release_waitlist_features', false);
}

export function useDynamicFeeFlag() {
  return useBoolVariation('release_dynamic_fee_feature', false);
}

export function useEarnFlag() {
  return useBoolVariation('release_earn_feature', false);
}

export function useDappSuggestions() {
  return useBoolVariation('release_dapp_suggestions_feature', false);
}

export function useSip10SendFlag() {
  return useBoolVariation('release_sip10_send_feature', false);
}

export function useSendPasteButton() {
  return useBoolVariation('send_paste_button', false);
}

export function useTokenDetailsFlag() {
  return useBoolVariation('token_details', false);
}

// Setting an empty string will not enforce a minimum version and will skip the check.
export function useMinimumAppVersion() {
  return useStringVariation('minimum_app_version', '');
}

export function useBtcConversionUnitFlag() {
  return useBoolVariation('release_btc_conversion_unit_feature', false);
}

export function useInternationalizationFlag() {
  return useBoolVariation('internationalization', false);
}

export function useTokenManagementFlag() {
  return useBoolVariation('release_token_management', false);
}

export function useSwapFlag() {
  return useBoolVariation('swap', false);
}

export function useOnramperBuyFlag() {
  return useBoolVariation('release_onramper_buy', false);
}

export function useOnramperSellFlag() {
  return useBoolVariation('release_onramper_sell', false);
}

export function useSwapSbtcBridgingFlag() {
  return useBoolVariation('swap_sbtc_bridging', false);
}
