import { decryptMnemonic as decrypt } from '@stacks/encryption';

import type { SoftwareKeyConfig } from './software-key.slice';

export interface DecryptedSoftwareKey {
  fingerprint: string;
  secretKey: string;
}

export async function decryptAllSoftwareKeys(
  softwareKeys: SoftwareKeyConfig[],
  encryptionKey: string
): Promise<DecryptedSoftwareKey[]> {
  if (softwareKeys.length === 0) throw new Error('Software wallet state is empty');
  return Promise.all(
    softwareKeys.map(async softwareKey => ({
      fingerprint: softwareKey.id,
      secretKey: await decrypt(softwareKey.encryptedSecretKey, encryptionKey),
    }))
  );
}
