import z from 'zod';

import { logger } from '@shared/logger';

import { store } from '@app/store';
import { selectSoftwareKeys } from '@app/store/software-keys/software-key.selectors';
import { type DecryptedSoftwareKey, decryptAllSoftwareKeys } from '@app/store/software-keys/utils';

import * as inMemoryStore from './in-memory-key/in-memory-storage';

async function initalizeWalletSession(encryptionKey: string) {
  return chrome.storage.session.set({ encryptionKey });
}

export async function clearWalletSession() {
  return chrome.storage.session.remove('encryptionKey');
}

async function getWalletSessionKey() {
  const key = await chrome.storage.session.get(['encryptionKey']);
  return z.string().safeParse(key.encryptionKey);
}

function setDecryptedSoftwareKeys(decryptedKeys: DecryptedSoftwareKey[]) {
  for (const { fingerprint, secretKey } of decryptedKeys) {
    inMemoryStore.setKey(fingerprint, secretKey);
  }
}

export async function initializeWalletSessionWithSoftwareKeys(
  encryptionKey: string,
  decryptedKeys: DecryptedSoftwareKey[]
) {
  await initalizeWalletSession(encryptionKey);
  setDecryptedSoftwareKeys(decryptedKeys);
}

export async function restoreWalletSession() {
  const keyResult = await getWalletSessionKey();

  if (!keyResult.success) return;

  try {
    const encryptedKeys = selectSoftwareKeys(store.getState());
    const decryptedKeys = await decryptAllSoftwareKeys(encryptedKeys, keyResult.data);
    setDecryptedSoftwareKeys(decryptedKeys);
  } catch {
    await clearWalletSession();
    inMemoryStore.clearAll();
    logger.error('Failed to decrypt secret key');
  }
}
