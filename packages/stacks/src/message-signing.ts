import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import { type PrivateKey } from '@stacks/common';
import { hashMessage } from '@stacks/encryption';
import {
  type ClarityValue,
  PubKeyEncoding,
  encodeStructuredDataBytes,
  privateKeyToPublic,
  publicKeyFromSignatureRsv,
  publicKeyToHex,
  signMessageHashRsv,
  signStructuredData,
} from '@stacks/transactions';

export interface SignatureData {
  signature: string;
  publicKey: string;
}
export function signMessage(message: string, privateKey: PrivateKey): SignatureData {
  const hash = hashMessage(message);
  return {
    signature: signMessageHashRsv({ privateKey, messageHash: bytesToHex(hash) }),
    publicKey: publicKeyToHex(privateKeyToPublic(privateKey)),
  };
}

export function signStructuredDataMessage(
  message: ClarityValue,
  domain: ClarityValue,
  privateKey: PrivateKey
): SignatureData {
  const signature = signStructuredData({
    message,
    domain,
    privateKey,
  });

  return {
    signature,
    publicKey: publicKeyToHex(privateKeyToPublic(privateKey)),
  };
}

interface VerifySip018SignatureArgs {
  message: ClarityValue;
  domain: ClarityValue;
  signature: string;
  publicKey: string;
}

// Verifies a SIP-018 structured-data signature: recomputes the signed message
// hash from the message + domain, recovers the public key from the RSV signature,
// and asserts it matches the expected signer. Returns false rather than throwing
// on malformed input.
export function verifySip018Signature({
  message,
  domain,
  signature,
  publicKey,
}: VerifySip018SignatureArgs): boolean {
  try {
    const messageHash = bytesToHex(sha256(encodeStructuredDataBytes({ message, domain })));
    const recovered = publicKeyFromSignatureRsv(messageHash, signature, PubKeyEncoding.Compressed);
    return recovered.toLowerCase() === publicKey.toLowerCase();
  } catch {
    return false;
  }
}
