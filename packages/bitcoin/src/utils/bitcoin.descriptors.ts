import { inferPaymentTypeFromPath } from './bitcoin.utils';

export function getDescriptorFromKeychain<T extends { keyOrigin: string; xpub: string }>(
  accountKeychain: T
) {
  switch (inferPaymentTypeFromPath(accountKeychain.keyOrigin)) {
    case 'p2tr':
      return `tr(${accountKeychain.xpub})`;
    case 'p2wpkh':
      return `wpkh(${accountKeychain.xpub})`;
    default:
      return undefined;
  }
}
