import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';

export function generateSignature(data: string, signingSecret: string): string {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);
  const signingSecretBytes = encoder.encode(signingSecret);
  const signatureBytes = hmac(sha256, signingSecretBytes, dataBytes);
  return bytesToHex(signatureBytes);
}

export function formatColorHexForParams(colorHex: string) {
  return colorHex.replace('#', '');
}

interface MatchAddresses<T> {
  btcAddress: string | undefined;
  stxAddress: string | undefined;
  resultMap: {
    bothAvailable: T;
    onlyBtc: T;
    onlyStx: T;
    none: T;
  };
}

export function matchAddresses<T>({ btcAddress, stxAddress, resultMap }: MatchAddresses<T>) {
  if (btcAddress && stxAddress) {
    return resultMap.bothAvailable;
  }
  if (btcAddress) {
    return resultMap.onlyBtc;
  }
  if (stxAddress) {
    return resultMap.onlyStx;
  }
  return resultMap.none;
}
