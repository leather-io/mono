import { base64urlnopad } from '@scure/base';
import { bytesToHex } from '@stacks/common';
import { decryptMnemonic, encryptMnemonic } from '@stacks/encryption';

import { isRecord } from './harness-state';
import { PrfCredentialConfig, generateRandomBytes, isRegistrationTag } from './webauthn-prf';

const walletEncryptionKeyByteLength = 48;
const aesGcmIvByteLength = 12;
const fixtureMnemonic =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
const platformUnlockVersion = 1;
const platformUnlockAadPrefix = 'leather-platform-unlock-v1';

interface FixturePlatformUnlockConfig extends PrfCredentialConfig {
  iv: string;
  version: number;
  wrappedEncryptionKey: string;
}

export interface PersistedFixtureState {
  authenticationMode: 'biometric-only';
  encryptedWallet: {
    encryptedSecretKey: string;
    id: string;
    type: 'software';
  };
  platformUnlock: FixturePlatformUnlockConfig;
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
    value.platformUnlock.version === platformUnlockVersion &&
    typeof value.platformUnlock.credentialId === 'string' &&
    typeof value.platformUnlock.prfInput === 'string' &&
    isRegistrationTag(value.platformUnlock.registrationTag) &&
    typeof value.platformUnlock.iv === 'string' &&
    typeof value.platformUnlock.wrappedEncryptionKey === 'string'
  );
}

function encodeBytes(bytes: Uint8Array) {
  return base64urlnopad.encode(bytes);
}

function decodeBytes(value: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(base64urlnopad.decode(value));
}

function createAdditionalData(credentialId: string, registrationTag: string) {
  return new TextEncoder().encode(`${platformUnlockAadPrefix}:${credentialId}:${registrationTag}`);
}

async function importPrfKey(prfOutput: Uint8Array<ArrayBuffer>, usage: KeyUsage) {
  return crypto.subtle.importKey('raw', prfOutput, { name: 'AES-GCM' }, false, [usage]);
}

async function wrapEncryptionKey(
  encryptionKey: string,
  prfOutput: Uint8Array<ArrayBuffer>,
  credentialId: string,
  registrationTag: string,
  iv: Uint8Array<ArrayBuffer>
) {
  const wrappingKey = await importPrfKey(prfOutput, 'encrypt');
  const wrapped = await crypto.subtle.encrypt(
    {
      additionalData: createAdditionalData(credentialId, registrationTag),
      iv,
      name: 'AES-GCM',
    },
    wrappingKey,
    new TextEncoder().encode(encryptionKey)
  );
  return new Uint8Array(wrapped);
}

async function unwrapEncryptionKey(
  state: PersistedFixtureState,
  prfOutput: Uint8Array<ArrayBuffer>
) {
  const wrappingKey = await importPrfKey(prfOutput, 'decrypt');
  const unwrapped = await crypto.subtle.decrypt(
    {
      additionalData: createAdditionalData(
        state.platformUnlock.credentialId,
        state.platformUnlock.registrationTag
      ),
      iv: decodeBytes(state.platformUnlock.iv),
      name: 'AES-GCM',
    },
    wrappingKey,
    decodeBytes(state.platformUnlock.wrappedEncryptionKey)
  );
  return new TextDecoder().decode(unwrapped);
}

export async function prepareFixtureState(
  config: PrfCredentialConfig,
  prfOutput: Uint8Array<ArrayBuffer>
): Promise<PersistedFixtureState> {
  const walletEncryptionKeyBytes = generateRandomBytes(walletEncryptionKeyByteLength);
  const walletEncryptionKey = bytesToHex(walletEncryptionKeyBytes);
  const iv = generateRandomBytes(aesGcmIvByteLength);
  const wrappedEncryptionKey = await wrapEncryptionKey(
    walletEncryptionKey,
    prfOutput,
    config.credentialId,
    config.registrationTag,
    iv
  );
  const encryptedSecretKey = bytesToHex(
    await encryptMnemonic(fixtureMnemonic, walletEncryptionKey)
  );
  walletEncryptionKeyBytes.fill(0);
  return {
    authenticationMode: 'biometric-only',
    encryptedWallet: {
      encryptedSecretKey,
      id: 'u0-fixture-wallet',
      type: 'software',
    },
    platformUnlock: {
      ...config,
      iv: encodeBytes(iv),
      version: platformUnlockVersion,
      wrappedEncryptionKey: encodeBytes(wrappedEncryptionKey),
    },
  };
}

export async function validateFixtureState(
  state: PersistedFixtureState,
  prfOutput: Uint8Array<ArrayBuffer>
) {
  try {
    if (state.platformUnlock.version !== platformUnlockVersion) return false;
    const encryptionKey = await unwrapEncryptionKey(state, prfOutput);
    if (!/^[0-9a-f]{96}$/.test(encryptionKey)) return false;
    const mnemonic = await decryptMnemonic(state.encryptedWallet.encryptedSecretKey, encryptionKey);
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
