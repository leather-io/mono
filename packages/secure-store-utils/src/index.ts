// Import the native module. On web, it will be resolved to SecureStoreUtils.web.ts
// and on native platforms to SecureStoreUtils.ts
import type { SecureStoreOptions } from 'expo-secure-store';

import SecureStoreUtils from './secure-store-utils';

export async function updateKeysSecuritySettingsAsync(keys: string[], options: SecureStoreOptions) {
  return await SecureStoreUtils.updateKeysSecuritySettingsAsync(keys, options);
}
