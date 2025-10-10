import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';

import { getBtcSignerLibNetworkConfigByMode } from './bitcoin.network';
import { deriveAddressIndexZeroFromAccount } from './bitcoin.utils';
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

export function deriveAddressFromDescriptor(descriptor: string): string | undefined {
  try {
    const xpubMatch = descriptor.match(/xpub[1-9A-HJ-NP-Za-km-z]{79,108}/);
    if (!xpubMatch) return undefined;

    const xpub = xpubMatch[0];
    const accountKeychain = HDKey.fromExtendedKey(xpub);
    const addressIndexKeychain = deriveAddressIndexZeroFromAccount(accountKeychain);

    if (!addressIndexKeychain.publicKey) return undefined;

    if (descriptor.startsWith('tr(')) {
      const payment = btc.p2tr(
        addressIndexKeychain.publicKey,
        undefined,
        getBtcSignerLibNetworkConfigByMode('mainnet')
      );
      return payment.address;
    } else if (descriptor.startsWith('wpkh(')) {
      const payment = btc.p2wpkh(
        addressIndexKeychain.publicKey,
        getBtcSignerLibNetworkConfigByMode('mainnet')
      );
      return payment.address;
    }

    return undefined;
  } catch {
    return undefined;
  }
}
