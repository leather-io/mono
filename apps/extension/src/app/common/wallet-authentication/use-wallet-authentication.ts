import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { deriveEncryptionKey } from '@shared/crypto/generate-encryption-key';
import { generateRandomHexString } from '@shared/crypto/generate-random-hex';
import { encryptMnemonicWithEncryptionKey } from '@shared/crypto/mnemonic-encryption';
import {
  type PlatformUnlockConfig,
  generateWalletEncryptionKey,
  isPlatformUnlockConfig,
  unwrapWalletEncryptionKey,
  wrapWalletEncryptionKey,
} from '@shared/crypto/platform-unlock';

import {
  type SoftwareKeyStateSnapshot,
  createSoftwareKeyState,
  readPersistedSoftwareKeyState,
} from '@app/store/software-keys/software-key-state';
import { selectWalletAuthenticationCapabilities } from '@app/store/software-keys/software-key.selectors';
import type {
  SoftwareKeyConfig,
  WalletAuthenticationMode,
} from '@app/store/software-keys/software-key.slice';
import { decryptAllSoftwareKeys } from '@app/store/software-keys/utils';
import { hydrateSlicesFromStorage } from '@app/store/utils/storage-sync';

import { createPlatformCredential, evaluatePlatformCredential } from './platform-authenticator';

type WalletAuthenticationFailureCode =
  | 'authentication-failed'
  | 'cancelled-or-timeout'
  | 'credential-mismatch'
  | 'invalid-config'
  | 'invalid-password'
  | 'prf-unavailable'
  | 'unavailable'
  | 'unsupported-browser'
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

export interface PasswordAuthenticationTransition {
  encryptionKey: string;
  keys: SoftwareKeyConfig[];
  platformUnlock: PlatformUnlockConfig;
  salt: string;
  sourceKeys: SoftwareKeyConfig[];
  sourcePlatformUnlock: PlatformUnlockConfig;
}

interface BiometricOnlyPasswordTransitionProof {
  currentEncryptionKey: string;
  platformUnlock: PlatformUnlockConfig;
  prfOutput: Uint8Array<ArrayBuffer>;
  softwareKeys: SoftwareKeyConfig[];
}

interface PlatformAuthenticatedEncryptionKey {
  encryptionKey: string;
  platformUnlock: PlatformUnlockConfig;
}

interface WalletAuthenticationSnapshot {
  capabilities: ReturnType<typeof selectWalletAuthenticationCapabilities.resultFunc>;
  state: SoftwareKeyStateSnapshot;
}

export interface PlatformUnlockChange {
  platformUnlock: PlatformUnlockConfig;
  sourceAuthenticationMode?: WalletAuthenticationMode;
  sourceKeys: SoftwareKeyConfig[];
  sourcePlatformUnlock?: PlatformUnlockConfig;
  sourceSalt?: string;
}

export interface BiometricSoftwareWalletPreparation {
  encryptionKey: string;
  key: SoftwareKeyConfig;
  platformUnlock: PlatformUnlockConfig;
}

type SoftwareKeyDecryptionResult =
  | { status: 'failure' }
  | { status: 'success'; value: Awaited<ReturnType<typeof decryptAllSoftwareKeys>> };

async function tryDecryptAllSoftwareKeys(
  softwareKeys: SoftwareKeyConfig[],
  encryptionKey: string
): Promise<SoftwareKeyDecryptionResult> {
  try {
    return {
      status: 'success',
      value: await decryptAllSoftwareKeys(softwareKeys, encryptionKey),
    };
  } catch {
    return { status: 'failure' };
  }
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

async function authenticateWithPlatformCredential({
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
  const unwrapped = await unwrapWalletEncryptionKey(platformUnlock, evaluation.value.prfOutput);
  evaluation.value.prfOutput.fill(0);
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
}

async function prepareBiometricOnlyPasswordTransitionProof({
  platformUnlock,
  softwareKeys,
}: AuthenticateWithPlatformCredentialArgs): Promise<
  WalletAuthenticationResult<BiometricOnlyPasswordTransitionProof>
> {
  if (!isPlatformUnlockConfig(platformUnlock)) {
    return { status: 'failure', code: 'invalid-config' };
  }
  const evaluation = await evaluatePlatformCredential(platformUnlock);
  if (evaluation.status === 'failure') return evaluation;
  try {
    const currentEncryptionKey = await unwrapWalletEncryptionKey(
      platformUnlock,
      evaluation.value.prfOutput
    );
    if (currentEncryptionKey.status === 'failure') {
      evaluation.value.prfOutput.fill(0);
      return currentEncryptionKey;
    }
    const decryptedSoftwareKeys = await tryDecryptAllSoftwareKeys(
      softwareKeys,
      currentEncryptionKey.value
    );
    if (decryptedSoftwareKeys.status === 'failure') {
      evaluation.value.prfOutput.fill(0);
      return { status: 'failure', code: 'wallet-validation-failed' };
    }
    return {
      status: 'success',
      value: {
        currentEncryptionKey: currentEncryptionKey.value,
        platformUnlock,
        prfOutput: evaluation.value.prfOutput,
        softwareKeys,
      },
    };
  } catch {
    evaluation.value.prfOutput.fill(0);
    return { status: 'failure', code: 'authentication-failed' };
  }
}

async function completeBiometricOnlyToPasswordTransition(
  password: string,
  proof: BiometricOnlyPasswordTransitionProof
): Promise<WalletAuthenticationResult<PasswordAuthenticationTransition>> {
  try {
    const decryptedSoftwareKeys = await tryDecryptAllSoftwareKeys(
      proof.softwareKeys,
      proof.currentEncryptionKey
    );
    if (decryptedSoftwareKeys.status === 'failure') {
      return { status: 'failure', code: 'wallet-validation-failed' };
    }
    const salt = generateRandomHexString();
    const encryptionKey = await deriveEncryptionKey({ password, salt });
    const keys = await Promise.all(
      decryptedSoftwareKeys.value.map(
        async ({ fingerprint, secretKey }): Promise<SoftwareKeyConfig> => ({
          ...(await encryptMnemonicWithEncryptionKey({ encryptionKey, secretKey })),
          id: fingerprint,
          type: 'software',
        })
      )
    );
    const wrapped = await wrapWalletEncryptionKey({
      credential: {
        credentialId: proof.platformUnlock.credentialId,
        prfInput: proof.platformUnlock.prfInput,
        registrationTag: proof.platformUnlock.registrationTag,
      },
      encryptionKey,
      prfOutput: proof.prfOutput,
    });
    if (wrapped.status === 'failure') return wrapped;
    return {
      status: 'success',
      value: {
        encryptionKey,
        keys,
        platformUnlock: wrapped.value,
        salt,
        sourceKeys: proof.softwareKeys,
        sourcePlatformUnlock: proof.platformUnlock,
      },
    };
  } catch {
    return { status: 'failure', code: 'authentication-failed' };
  } finally {
    proof.prfOutput.fill(0);
  }
}

async function prepareBiometricOnlyToPasswordTransition({
  password,
  platformUnlock,
  softwareKeys,
}: AuthenticateWithPlatformCredentialArgs & {
  password: string;
}): Promise<WalletAuthenticationResult<PasswordAuthenticationTransition>> {
  const proof = await prepareBiometricOnlyPasswordTransitionProof({ platformUnlock, softwareKeys });
  if (proof.status === 'failure') return proof;
  return completeBiometricOnlyToPasswordTransition(password, proof.value);
}

async function loadWalletAuthenticationSnapshot(
  dispatch: ReturnType<typeof useDispatch>
): Promise<WalletAuthenticationResult<WalletAuthenticationSnapshot>> {
  try {
    const persisted = await readPersistedSoftwareKeyState();
    if (persisted.status !== 'valid') return { status: 'failure', code: 'invalid-config' };
    const capabilities = selectWalletAuthenticationCapabilities.resultFunc({
      authenticationMode: persisted.value.authenticationMode,
      ids: persisted.value.keys.map(key => key.id),
      platformUnlock: persisted.value.platformUnlock,
      salt: persisted.value.salt,
    });
    if (!capabilities.valid || persisted.value.keys.length === 0) {
      return { status: 'failure', code: 'invalid-config' };
    }
    dispatch(hydrateSlicesFromStorage({ softwareKeys: createSoftwareKeyState(persisted.value) }));
    return { status: 'success', value: { capabilities, state: persisted.value } };
  } catch {
    return { status: 'failure', code: 'unavailable' };
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

async function prepareBiometricSoftwareWallet({
  fingerprint,
  mnemonic,
}: {
  fingerprint: string;
  mnemonic: string;
}): Promise<WalletAuthenticationResult<BiometricSoftwareWalletPreparation>> {
  const encryptionKey = generateWalletEncryptionKey();
  const platformUnlock = await createWrappedPlatformUnlock(encryptionKey);
  if (platformUnlock.status === 'failure') return platformUnlock;
  try {
    const encrypted = await encryptMnemonicWithEncryptionKey({
      encryptionKey,
      secretKey: mnemonic,
    });
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
  } catch {
    return { status: 'failure', code: 'authentication-failed' };
  }
}

async function preparePlatformUnlockChange({
  encryptionKey,
  sourceAuthenticationMode,
  sourceKeys,
  sourcePlatformUnlock,
  sourceSalt,
}: Omit<PlatformUnlockChange, 'platformUnlock'> & {
  encryptionKey: string;
}): Promise<WalletAuthenticationResult<PlatformUnlockChange>> {
  const platformUnlock = await createWrappedPlatformUnlock(encryptionKey);
  if (platformUnlock.status === 'failure') return platformUnlock;
  return {
    status: 'success',
    value: {
      platformUnlock: platformUnlock.value,
      sourceAuthenticationMode,
      sourceKeys,
      sourcePlatformUnlock,
      sourceSalt,
    },
  };
}

export function useWalletAuthentication() {
  const capabilities = useSelector(selectWalletAuthenticationCapabilities);
  const dispatch = useDispatch();

  return useMemo(
    () => ({
      capabilities,
      prepareBiometricSoftwareWallet,
      async authenticateWithPassword(password: string): Promise<WalletAuthenticationResult> {
        const current = await loadWalletAuthenticationSnapshot(dispatch);
        if (current.status === 'failure') return current;
        const { capabilities: currentCapabilities, state } = current.value;
        if (!currentCapabilities.password || !state.salt) {
          return { status: 'failure', code: 'invalid-config' };
        }
        return authenticateWithPassword({
          password,
          salt: state.salt,
          softwareKeys: state.keys,
        });
      },
      async authenticateWithPlatformCredential(): Promise<
        WalletAuthenticationResult<PlatformAuthenticatedEncryptionKey>
      > {
        const current = await loadWalletAuthenticationSnapshot(dispatch);
        if (current.status === 'failure') return current;
        if (!current.value.capabilities.biometrics) {
          return { status: 'failure', code: 'invalid-config' };
        }
        return authenticateWithPlatformCredential({
          platformUnlock: current.value.state.platformUnlock,
          softwareKeys: current.value.state.keys,
        });
      },
      async prepareBiometricOnlyToPasswordTransition(
        password: string
      ): Promise<WalletAuthenticationResult<PasswordAuthenticationTransition>> {
        const current = await loadWalletAuthenticationSnapshot(dispatch);
        if (current.status === 'failure') return current;
        if (current.value.capabilities.authenticationMode !== 'biometric-only') {
          return { status: 'failure', code: 'invalid-config' };
        }
        return prepareBiometricOnlyToPasswordTransition({
          password,
          platformUnlock: current.value.state.platformUnlock,
          softwareKeys: current.value.state.keys,
        });
      },
      async preparePlatformUnlockWithPassword(
        password: string
      ): Promise<WalletAuthenticationResult<PlatformUnlockChange>> {
        const current = await loadWalletAuthenticationSnapshot(dispatch);
        if (current.status === 'failure') return current;
        const { capabilities: currentCapabilities, state } = current.value;
        if (currentCapabilities.authenticationMode !== 'password' || !state.salt) {
          return { status: 'failure', code: 'invalid-config' };
        }
        const authentication = await authenticateWithPassword({
          password,
          salt: state.salt,
          softwareKeys: state.keys,
        });
        if (authentication.status === 'failure') return authentication;
        return preparePlatformUnlockChange({
          encryptionKey: authentication.value,
          sourceAuthenticationMode: state.authenticationMode,
          sourceKeys: state.keys,
          sourcePlatformUnlock: state.platformUnlock,
          sourceSalt: state.salt,
        });
      },
      async preparePlatformUnlockWithBiometrics(): Promise<
        WalletAuthenticationResult<PlatformUnlockChange>
      > {
        const current = await loadWalletAuthenticationSnapshot(dispatch);
        if (current.status === 'failure') return current;
        const { capabilities: currentCapabilities, state } = current.value;
        if (currentCapabilities.authenticationMode !== 'biometric-only') {
          return { status: 'failure', code: 'invalid-config' };
        }
        const authentication = await authenticateWithPlatformCredential({
          platformUnlock: state.platformUnlock,
          softwareKeys: state.keys,
        });
        if (authentication.status === 'failure') return authentication;
        return preparePlatformUnlockChange({
          encryptionKey: authentication.value.encryptionKey,
          sourceAuthenticationMode: state.authenticationMode,
          sourceKeys: state.keys,
          sourcePlatformUnlock: authentication.value.platformUnlock,
          sourceSalt: state.salt,
        });
      },
    }),
    [capabilities, dispatch]
  );
}
