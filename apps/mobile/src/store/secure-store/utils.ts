import { t } from '@lingui/core/macro';
import * as SecureStore from 'expo-secure-store';
import { z } from 'zod';

export function getBasicSecureStoreConfig() {
  const secureStoreConfig: SecureStore.SecureStoreOptions = {
    authenticationPrompt: t`Allow app to access secure storage`,
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  };
  return secureStoreConfig;
}

function getBiometricsSecureStoreConfig() {
  const secureStoreConfigWithBiometrics = {
    ...getBasicSecureStoreConfig(),
    requireAuthentication: true,
  };
  return secureStoreConfigWithBiometrics;
}

export function getSecureStoreConfig(biometrics: boolean) {
  if (biometrics) {
    return getBiometricsSecureStoreConfig();
  }
  return getBasicSecureStoreConfig();
}

export const mnemonicSchema = z.object({
  mnemonic: z.string(),
  passphrase: z.string().optional(),
});
export type Mnemonic = z.infer<typeof mnemonicSchema>;
