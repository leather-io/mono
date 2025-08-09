import { Linking, Platform } from 'react-native';

import { t } from '@lingui/core/macro';

const IOS_APP_ID = 'id6499127775';
const ANDROID_PACKAGE_NAME = 'io.leather.mobilewallet';

export function getStoreUrl(): string {
  return Platform.select({
    ios: `https://apps.apple.com/us/app/leather-self-custody-wallet/${IOS_APP_ID}`,
    android: `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`,
    default: 'https://leather.io/mobile',
  });
}

export async function openAppStore(): Promise<void> {
  const storeUrl = getStoreUrl();
  const canOpen = await Linking.canOpenURL(storeUrl);

  if (!canOpen) {
    throw new Error(`Cannot open store URL: ${storeUrl}`);
  }

  await Linking.openURL(storeUrl);
}

export async function handleStoreRedirect(): Promise<void> {
  try {
    await openAppStore();
  } catch {
    const userMessage = t`Unable to open app store. Please update the app manually from your device’s app store.`;

    throw new Error(userMessage);
  }
}

export function getStoreName(): string {
  return Platform.select({
    ios: t`App Store`,
    android: t`Google Play`,
    default: t`App Store`,
  });
}

/**
 * Get platform-specific store button text
 * @returns Button text for the current platform
 */
export function getStoreButtonText(): string {
  const storeName = getStoreName();
  return t`Update from ${storeName}`;
}
