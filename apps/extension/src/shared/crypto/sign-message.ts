import { type PrivateKey, bytesToHex } from '@stacks/common';
import { hashMessage } from '@stacks/encryption';
import {
  type ClarityValue,
  privateKeyToPublic,
  publicKeyToHex,
  signMessageHashRsv,
  signStructuredData,
} from '@stacks/transactions';

import { type SignatureData } from '@shared/signature/signature-types';

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
