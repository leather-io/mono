import { bytesToHex } from '@stacks/common';
import { decryptMnemonic as decrypt, encryptMnemonic as encrypt } from '@stacks/encryption';

import { getMnemonicRootKeyFingerprint } from '@leather.io/crypto';

import { deriveEncryptionKey } from './generate-encryption-key';
import { generateRandomHexString } from './generate-random-hex';

interface EncryptMnemonicArgs {
  secretKey: string;
  password: string;
  existingEncryptionKey?: string;
  existingSalt?: string;
}
export async function encryptMnemonic({
  secretKey,
  password,
  existingEncryptionKey,
  existingSalt,
}: EncryptMnemonicArgs) {
  const salt = existingSalt ? existingSalt : generateRandomHexString();
  const encryptionKey = existingEncryptionKey
    ? existingEncryptionKey
    : await deriveEncryptionKey({ password, salt });
  const encryptedBuffer = await encrypt(secretKey, encryptionKey);
  return {
    salt,
    encryptedSecretKey: bytesToHex(encryptedBuffer),
    encryptionKey,
  };
}

/**
 * Decrypt an encrypted secret key. If no salt is present, then this encrypted key was
 * generated before introducing Argon2 hashing. If that is true, then
 * decrypt the secret key and re-encrypt it using an Argon2 hashed password.
 */
interface DecryptionMnemonic {
  encryptedSecretKey: string;
  password: string;
  salt?: string;
}
export async function decryptMnemonic({
  encryptedSecretKey,
  password,
  salt,
}: DecryptionMnemonic): Promise<{
  encryptedSecretKey: string;
  salt: string;
  secretKey: string;
  encryptionKey: string;
  fingerprint: string;
}> {
  if (salt) {
    const encryptionKey = await deriveEncryptionKey({ password, salt });
    const secretKey = await decrypt(encryptedSecretKey, encryptionKey);
    return {
      secretKey,
      encryptedSecretKey,
      salt,
      encryptionKey,
      fingerprint: getMnemonicRootKeyFingerprint(secretKey),
    };
  } else {
    const secretKey = await decrypt(encryptedSecretKey, password);
    const newEncryptedKey = await encryptMnemonic({ secretKey, password });
    return {
      secretKey,
      encryptedSecretKey: newEncryptedKey.encryptedSecretKey,
      salt: newEncryptedKey.salt,
      encryptionKey: newEncryptedKey.encryptionKey,
      fingerprint: getMnemonicRootKeyFingerprint(secretKey),
    };
  }
}
