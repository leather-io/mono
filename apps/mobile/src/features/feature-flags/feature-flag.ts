import { AutoEnvAttributes, ReactNativeLDClient } from '@launchdarkly/react-native-client-sdk';
import * as Application from 'expo-application';

export const featureFlagClient = new ReactNativeLDClient(
  // TODO: do not fallback to empty string
  process.env.EXPO_PUBLIC_LAUNCH_DARKLY ?? '',
  AutoEnvAttributes.Enabled,
  {
    debug: process.env.NODE_ENV === 'development',
    applicationInfo: {
      id: 'leather-mobile-wallet',
      version: Application.nativeApplicationVersion ?? '0.0.1',
    },
  }
);

export const featureFlagKeys = {
  releasePushNotifications: {
    key: 'release_push_notifications',
    defaultValue: false,
  },
};

export type FEATURE_FLAG_KEYS = keyof typeof featureFlagKeys;
