import { deriveEncryptionKey } from '@shared/crypto/generate-encryption-key';
import { encryptMnemonicWithEncryptionKey } from '@shared/crypto/mnemonic-encryption';
import {
  type PlatformUnlockConfig,
  generateWalletEncryptionKey,
  isPlatformUnlockConfig,
  unwrapWalletEncryptionKey,
  wrapWalletEncryptionKey,
} from '@shared/crypto/platform-unlock';

import type { SoftwareKeyConfig } from '@app/store/software-keys/software-key.slice';
import { decryptAllSoftwareKeys } from '@app/store/software-keys/utils';

import { createPlatformCredential, evaluatePlatformCredential } from './platform-authenticator';

export type WalletAuthenticationFailureCode =
  | 'authentication-failed'
  | 'cancelled-or-timeout'
  | 'credential-mismatch'
  | 'invalid-config'
  | 'invalid-password'
  | 'persistence-failed'
  | 'prf-unavailable'
  | 'state-changed'
  | 'unavailable'
  | 'unsupported-browser'
  | 'wallet-already-exists'
  | 'wallet-validation-failed';

interface WalletAuthenticationFailure {
  status: 'failure';
  code: WalletAuthenticationFailureCode;
}

interface WalletAuthenticationSuccess<T> {
  status: 'success';
  value: T;
}

export type WalletAuthenticationResult<T = string> =
  | WalletAuthenticationFailure
  | WalletAuthenticationSuccess<T>;

interface AuthenticateWithPasswordArgs {
  password: string;
  salt: string;
  softwareKeys: SoftwareKeyConfig[];
}

interface AuthenticateWithPlatformCredentialArgs {
  platformUnlock: unknown;
  softwareKeys: SoftwareKeyConfig[];
}

interface PlatformAuthenticatedEncryptionKey {
  encryptionKey: string;
  platformUnlock: PlatformUnlockConfig;
}

interface BiometricSoftwareWalletPreparation {
  encryptionKey: string;
  key: SoftwareKeyConfig;
  platformUnlock: PlatformUnlockConfig;
}

export class WalletAuthenticationError extends Error {
  readonly code: WalletAuthenticationFailureCode;

  constructor(code: WalletAuthenticationFailureCode) {
    super(code);
    this.name = WalletAuthenticationError.name;
    this.code = code;
  }
}

export function walletAuthenticationFailureFromError(error: unknown): WalletAuthenticationFailure {
  if (error instanceof WalletAuthenticationError) {
    return { status: 'failure', code: error.code };
  }
  return { status: 'failure', code: 'unavailable' };
}

export async function authenticateWithPassword({
  password,
  salt,
  softwareKeys,
}: AuthenticateWithPasswordArgs): Promise<WalletAuthenticationResult> {
  try {
    const encryptionKey = await deriveEncryptionKey({ password, salt });
    await decryptAllSoftwareKeys(softwareKeys, encryptionKey);
    return { status: 'success', value: encryptionKey };
  } catch {
    return { status: 'failure', code: 'invalid-password' };
  }
}

export async function authenticateWithPlatformCredential({
  platformUnlock,
  softwareKeys,
}: AuthenticateWithPlatformCredentialArgs): Promise<
  WalletAuthenticationResult<PlatformAuthenticatedEncryptionKey>
> {
  if (!isPlatformUnlockConfig(platformUnlock)) {
    return { status: 'failure', code: 'invalid-config' };
  }
  const evaluation = await evaluatePlatformCredential(platformUnlock);
  if (evaluation.status === 'failure') return evaluation;
  try {
    const unwrapped = await unwrapWalletEncryptionKey(platformUnlock, evaluation.value.prfOutput);
    if (unwrapped.status === 'failure') return unwrapped;
    try {
      await decryptAllSoftwareKeys(softwareKeys, unwrapped.value);
      return {
        status: 'success',
        value: { encryptionKey: unwrapped.value, platformUnlock },
      };
    } catch {
      return { status: 'failure', code: 'wallet-validation-failed' };
    }
  } finally {
    evaluation.value.prfOutput.fill(0);
  }
}

async function createWrappedPlatformUnlock(
  encryptionKey: string
): Promise<WalletAuthenticationResult<PlatformUnlockConfig>> {
  const enrollment = await createPlatformCredential();
  if (enrollment.status === 'failure') return enrollment;
  try {
    return await wrapWalletEncryptionKey({
      credential: enrollment.value.credential,
      encryptionKey,
      prfOutput: enrollment.value.prfOutput,
    });
  } finally {
    enrollment.value.prfOutput.fill(0);
  }
}

async function encryptBiometricMnemonic(encryptionKey: string, mnemonic: string) {
  try {
    return await encryptMnemonicWithEncryptionKey({
      encryptionKey,
      secretKey: mnemonic,
    });
  } catch {
    return;
  }
}

export async function prepareBiometricSoftwareWallet({
  fingerprint,
  mnemonic,
}: {
  fingerprint: string;
  mnemonic: string;
}): Promise<WalletAuthenticationResult<BiometricSoftwareWalletPreparation>> {
  const encryptionKey = generateWalletEncryptionKey();
  const encrypted = await encryptBiometricMnemonic(encryptionKey, mnemonic);
  if (!encrypted) return { status: 'failure', code: 'authentication-failed' };
  const platformUnlock = await createWrappedPlatformUnlock(encryptionKey);
  if (platformUnlock.status === 'failure') return platformUnlock;
  return {
    status: 'success',
    value: {
      encryptionKey,
      key: {
        encryptedSecretKey: encrypted.encryptedSecretKey,
        id: fingerprint,
        type: 'software',
      },
      platformUnlock: platformUnlock.value,
    },
  };
}
