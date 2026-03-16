import { decryptMnemonic as decrypt } from '@stacks/encryption';
import z from 'zod';

import { logger } from '@shared/logger';

import { store } from '@app/store';
import { selectSoftwareKeys } from '@app/store/software-keys/software-key.selectors';

import * as inMemoryStore from './in-memory-key/in-memory-storage';

export async function initalizeWalletSession(encryptionKey: string) {
  return chrome.storage.session.set({ encryptionKey });
}

export async function clearWalletSession() {
  return chrome.storage.session.remove('encryptionKey');
}

async function getWalletSessionKey() {
  const key = await chrome.storage.session.get(['encryptionKey']);
  return z.string().safeParse(key.encryptionKey);
}

export async function restoreWalletSession() {
  const keyResult = await getWalletSessionKey();

  if (!keyResult.success) return;

  try {
    const encryptedKeys = selectSoftwareKeys(store.getState());

    const decryptedKeys = await Promise.all(
      encryptedKeys.map(async softwareKey => ({
        fingerprint: softwareKey.id,
        secretKey: await decrypt(softwareKey.encryptedSecretKey, keyResult.data),
      }))
    );

    for (const { fingerprint, secretKey } of decryptedKeys) {
      inMemoryStore.setKey(fingerprint, secretKey);
    }
  } catch {
    logger.error('Failed to decrypt secret key');
  }
}
