import { bytesToHex } from '@noble/hashes/utils';
import { PrivateKey } from '@stacks/common';
import { hashMessage } from '@stacks/encryption';
import {
  ClarityValue,
  privateKeyToPublic,
  signMessageHashRsv,
  signStructuredData,
} from '@stacks/transactions';

interface SignatureData {
  signature: string;
  publicKey: string;
}
export function signMessage(message: string, privateKey: PrivateKey): SignatureData {
  const hash = hashMessage(message);
  return {
    signature: signMessageHashRsv({ privateKey, messageHash: bytesToHex(hash) }),
    publicKey: privateKeyToPublic(privateKey) as string,
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
    publicKey: privateKeyToPublic(privateKey) as string,
  };
}
