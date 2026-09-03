import { bytesToHex } from '@stacks/common';
import { decryptMnemonic, encryptMnemonic } from '@stacks/encryption';

import {
  type PlatformUnlockConfig,
  type PlatformUnlockCredentialConfig,
  generateWalletEncryptionKey,
  isPlatformUnlockConfig,
  unwrapWalletEncryptionKey,
  wrapWalletEncryptionKey,
} from '@shared/crypto/platform-unlock';

import { isRecord } from './harness-state';

const fixtureMnemonic =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

export interface PersistedFixtureState {
  authenticationMode: 'biometric-only';
  encryptedWallet: {
    encryptedSecretKey: string;
    id: string;
    type: 'software';
  };
  platformUnlock: PlatformUnlockConfig;
}

interface FixturePersistenceDependencies {
  initialize(): Promise<void>;
  persist(state: PersistedFixtureState): Promise<void>;
}

export function isPersistedFixtureState(value: unknown): value is PersistedFixtureState {
  if (!isRecord(value) || value.authenticationMode !== 'biometric-only') return false;
  if (!isRecord(value.encryptedWallet) || !isRecord(value.platformUnlock)) return false;
  return (
    value.encryptedWallet.type === 'software' &&
    typeof value.encryptedWallet.id === 'string' &&
    typeof value.encryptedWallet.encryptedSecretKey === 'string' &&
    isPlatformUnlockConfig(value.platformUnlock)
  );
}

export async function prepareFixtureState(
  config: PlatformUnlockCredentialConfig,
  prfOutput: Uint8Array<ArrayBuffer>
): Promise<PersistedFixtureState> {
  const walletEncryptionKey = generateWalletEncryptionKey();
  const wrappedEncryptionKey = await wrapWalletEncryptionKey({
    credential: config,
    encryptionKey: walletEncryptionKey,
    prfOutput,
  });
  if (wrappedEncryptionKey.status === 'failure') {
    throw new Error('Fixture wallet encryption key could not be wrapped');
  }
  const encryptedSecretKey = bytesToHex(
    await encryptMnemonic(fixtureMnemonic, walletEncryptionKey)
  );
  return {
    authenticationMode: 'biometric-only',
    encryptedWallet: {
      encryptedSecretKey,
      id: 'u0-fixture-wallet',
      type: 'software',
    },
    platformUnlock: wrappedEncryptionKey.value,
  };
}

export async function validateFixtureState(
  state: PersistedFixtureState,
  prfOutput: Uint8Array<ArrayBuffer>
) {
  try {
    const encryptionKey = await unwrapWalletEncryptionKey(state.platformUnlock, prfOutput);
    if (encryptionKey.status === 'failure') return false;
    const mnemonic = await decryptMnemonic(
      state.encryptedWallet.encryptedSecretKey,
      encryptionKey.value
    );
    return mnemonic === fixtureMnemonic;
  } catch {
    return false;
  }
}

export async function persistFixtureStateAtomically(
  state: PersistedFixtureState,
  { initialize, persist }: FixturePersistenceDependencies
) {
  await persist(state);
  await initialize();
}
