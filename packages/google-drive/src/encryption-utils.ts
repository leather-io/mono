import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';
import { randomBytes } from '@noble/ciphers/utils.js';
import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';

import { WalletEnvelope } from '@leather.io/models';

const MK_BYTES = 32;
const KDF_SALT_BYTES = 16;
const NONCE_BYTES = 24;

const PBKDF2_ITERATIONS = 10000;

function toBase64(value: Uint8Array) {
  return Buffer.from(value).toString('base64');
}

function fromBase64(value: string) {
  return new Uint8Array(Buffer.from(value, 'base64'));
}

async function deriveKEKFromPin(password: string, salt: Uint8Array) {
  return await pbkdf2Async(sha256, password, salt, {
    c: PBKDF2_ITERATIONS,
    dkLen: MK_BYTES,
  });
}

export async function encryptEnvelope(mnemonic: string, password: string, passphrase?: string) {
  const masterKey = randomBytes(MK_BYTES);

  const mnemonicNonce = randomBytes(NONCE_BYTES);
  const cypher = xchacha20poly1305(masterKey, mnemonicNonce);
  const encryptedMnemonic = cypher.encrypt(new TextEncoder().encode(mnemonic));

  let encryptedPassphrase: Uint8Array | undefined;
  let passphraseNonce: Uint8Array | undefined;

  if (passphrase) {
    passphraseNonce = randomBytes(NONCE_BYTES);
    const passphraseCypher = xchacha20poly1305(masterKey, passphraseNonce);
    encryptedPassphrase = passphraseCypher.encrypt(new TextEncoder().encode(passphrase));
  }

  const salt = randomBytes(KDF_SALT_BYTES);
  const kek = await deriveKEKFromPin(password, salt);

  const wrapNonce = randomBytes(NONCE_BYTES);
  const wrapper = xchacha20poly1305(kek, wrapNonce);
  const wrappedMk = wrapper.encrypt(masterKey);

  return {
    encryptedMnemonic: toBase64(encryptedMnemonic),
    mnemonicNonce: toBase64(mnemonicNonce),
    salt: toBase64(salt),
    iterations: PBKDF2_ITERATIONS,
    wrappedMk: toBase64(wrappedMk),
    wrapNonce: toBase64(wrapNonce),
    encryptedPassphrase: encryptedPassphrase ? toBase64(encryptedPassphrase) : undefined,
    passphraseNonce: passphraseNonce ? toBase64(passphraseNonce) : undefined,
  };
}

export async function decryptEnvelope(
  encryptedEnvelope: WalletEnvelope,
  password: string
): Promise<{ mnemonic: string; passphrase: string | undefined }> {
  const salt = fromBase64(encryptedEnvelope.protection.kdf.salt);
  const kek = await deriveKEKFromPin(password, salt);
  const wrappedNonce = fromBase64(encryptedEnvelope.protection.wrappedNonce);
  const wrappedMk = fromBase64(encryptedEnvelope.protection.wrappedMk);
  const wrapper = xchacha20poly1305(kek, wrappedNonce);
  const masterKey = wrapper.decrypt(wrappedMk);
  const mnemonicNonce = fromBase64(encryptedEnvelope.mnemonicNonce);
  const cypher = xchacha20poly1305(masterKey, mnemonicNonce);
  const encryptedMnemonic = fromBase64(encryptedEnvelope.encryptedMnemonic);
  const mnemonicBytes = cypher.decrypt(encryptedMnemonic);
  let passphrase: string | undefined = undefined;
  if (encryptedEnvelope.encryptedPassphrase && encryptedEnvelope.passphraseNonce) {
    const encryptedPassphrase = fromBase64(encryptedEnvelope.encryptedPassphrase);
    const passphraseNonce = fromBase64(encryptedEnvelope.passphraseNonce);
    const passphraseCypher = xchacha20poly1305(masterKey, passphraseNonce);
    const passphraseBytes = passphraseCypher.decrypt(encryptedPassphrase);
    passphrase = new TextDecoder().decode(passphraseBytes);
  }
  return {
    mnemonic: new TextDecoder().decode(mnemonicBytes),
    passphrase,
  };
}
