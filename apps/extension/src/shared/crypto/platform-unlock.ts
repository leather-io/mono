import { base64urlnopad } from '@scure/base';

import { generateRandomHexString } from './generate-random-hex';

const platformUnlockVersion = 1;
const prfInputByteLength = 32;
const prfOutputByteLength = 32;
const aesGcmIvByteLength = 12;
const wrappedEncryptionKeyByteLength = 112;
const walletEncryptionKeyByteLength = 48;
const maximumCredentialIdByteLength = 1023;
const platformUnlockAadPrefix = 'leather-platform-unlock-v1';

export interface PlatformUnlockCredentialConfig {
  credentialId: string;
  prfInput: string;
  registrationTag: string;
}

export interface PlatformUnlockConfig extends PlatformUnlockCredentialConfig {
  iv: string;
  version: 1;
  wrappedEncryptionKey: string;
}

type PlatformUnlockFailureCode = 'authentication-failed' | 'invalid-config' | 'unavailable';

interface PlatformUnlockFailure {
  status: 'failure';
  code: PlatformUnlockFailureCode;
}

interface PlatformUnlockSuccess<T> {
  status: 'success';
  value: T;
}

type PlatformUnlockResult<T> = PlatformUnlockFailure | PlatformUnlockSuccess<T>;

interface WrapWalletEncryptionKeyArgs {
  credential: PlatformUnlockCredentialConfig;
  encryptionKey: string;
  prfOutput: Uint8Array<ArrayBuffer>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isRegistrationTag(value: unknown): value is string {
  return typeof value === 'string' && /^[A-HJ-NP-Z2-9]{6}$/.test(value);
}

function isWalletEncryptionKey(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{96}$/.test(value);
}

export function generateWalletEncryptionKey() {
  return generateRandomHexString(walletEncryptionKeyByteLength);
}

function decodeCanonicalBytes(value: string): Uint8Array<ArrayBuffer> | undefined {
  try {
    const decoded = new Uint8Array(base64urlnopad.decode(value));
    return base64urlnopad.encode(decoded) === value ? decoded : undefined;
  } catch {
    return;
  }
}

export function isPlatformUnlockCredentialConfig(
  value: unknown
): value is PlatformUnlockCredentialConfig {
  if (!isRecord(value)) return false;
  if (
    typeof value.credentialId !== 'string' ||
    typeof value.prfInput !== 'string' ||
    !isRegistrationTag(value.registrationTag)
  ) {
    return false;
  }
  const credentialId = decodeCanonicalBytes(value.credentialId);
  const prfInput = decodeCanonicalBytes(value.prfInput);
  return (
    !!credentialId &&
    credentialId.byteLength > 0 &&
    credentialId.byteLength <= maximumCredentialIdByteLength &&
    prfInput?.byteLength === prfInputByteLength
  );
}

export function isPlatformUnlockConfig(value: unknown): value is PlatformUnlockConfig {
  if (!isRecord(value) || value.version !== platformUnlockVersion) return false;
  if (!isPlatformUnlockCredentialConfig(value)) return false;
  if (typeof value.iv !== 'string' || typeof value.wrappedEncryptionKey !== 'string') return false;
  const iv = decodeCanonicalBytes(value.iv);
  const wrappedEncryptionKey = decodeCanonicalBytes(value.wrappedEncryptionKey);
  return (
    iv?.byteLength === aesGcmIvByteLength &&
    wrappedEncryptionKey?.byteLength === wrappedEncryptionKeyByteLength
  );
}

function createAdditionalData({ credentialId, registrationTag }: PlatformUnlockCredentialConfig) {
  return new TextEncoder().encode(`${platformUnlockAadPrefix}:${credentialId}:${registrationTag}`);
}

async function importPrfKey(prfOutput: Uint8Array<ArrayBuffer>, keyUsage: KeyUsage) {
  return crypto.subtle.importKey('raw', prfOutput, { name: 'AES-GCM' }, false, [keyUsage]);
}

export async function wrapWalletEncryptionKey({
  credential,
  encryptionKey,
  prfOutput,
}: WrapWalletEncryptionKeyArgs): Promise<PlatformUnlockResult<PlatformUnlockConfig>> {
  if (
    !isPlatformUnlockCredentialConfig(credential) ||
    !isWalletEncryptionKey(encryptionKey) ||
    prfOutput.byteLength !== prfOutputByteLength
  ) {
    return { status: 'failure', code: 'invalid-config' };
  }
  try {
    const iv = crypto.getRandomValues(new Uint8Array(aesGcmIvByteLength));
    const wrappingKey = await importPrfKey(prfOutput, 'encrypt');
    const wrapped = await crypto.subtle.encrypt(
      {
        additionalData: createAdditionalData(credential),
        iv,
        name: 'AES-GCM',
      },
      wrappingKey,
      new TextEncoder().encode(encryptionKey)
    );
    return {
      status: 'success',
      value: {
        ...credential,
        iv: base64urlnopad.encode(iv),
        version: platformUnlockVersion,
        wrappedEncryptionKey: base64urlnopad.encode(new Uint8Array(wrapped)),
      },
    };
  } catch {
    return { status: 'failure', code: 'unavailable' };
  }
}

export async function unwrapWalletEncryptionKey(
  config: unknown,
  prfOutput: Uint8Array<ArrayBuffer>
): Promise<PlatformUnlockResult<string>> {
  if (!isPlatformUnlockConfig(config) || prfOutput.byteLength !== prfOutputByteLength) {
    return { status: 'failure', code: 'invalid-config' };
  }
  const iv = decodeCanonicalBytes(config.iv);
  const wrappedEncryptionKey = decodeCanonicalBytes(config.wrappedEncryptionKey);
  if (!iv || !wrappedEncryptionKey) return { status: 'failure', code: 'invalid-config' };
  try {
    const wrappingKey = await importPrfKey(prfOutput, 'decrypt');
    const encryptionKeyBytes = await crypto.subtle.decrypt(
      {
        additionalData: createAdditionalData(config),
        iv,
        name: 'AES-GCM',
      },
      wrappingKey,
      wrappedEncryptionKey
    );
    const encryptionKey = new TextDecoder().decode(encryptionKeyBytes);
    if (!isWalletEncryptionKey(encryptionKey)) {
      return { status: 'failure', code: 'authentication-failed' };
    }
    return { status: 'success', value: encryptionKey };
  } catch {
    return { status: 'failure', code: 'authentication-failed' };
  }
}
