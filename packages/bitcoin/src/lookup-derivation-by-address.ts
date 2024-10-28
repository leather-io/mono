import { HARDENED_OFFSET, HDKey } from '@scure/bip32';

import { createCounter } from '@leather.io/utils';

import {
  getNativeSegwitAddress,
  getTaprootAddress,
  inferNetworkFromAddress,
  inferPaymentTypeFromAddress,
  whenSupportedPaymentType,
} from './bitcoin.utils';
import { makeTaprootAddressIndexDerivationPath } from './p2tr-address-gen';
import { makeNativeSegwitAddressIndexDerivationPath } from './p2wpkh-address-gen';

interface LookUpDerivationByAddressArgs {
  taprootXpub: string;
  nativeSegwitXpub: string;
  iterationLimit: number;
}
export function lookupDerivationByAddress(args: LookUpDerivationByAddressArgs) {
  const { taprootXpub, nativeSegwitXpub, iterationLimit } = args;

  const taprootKeychain = HDKey.fromExtendedKey(taprootXpub);
  const nativeSegwitKeychain = HDKey.fromExtendedKey(nativeSegwitXpub);

  return (address: string) => {
    const network = inferNetworkFromAddress(address);
    const paymentType = inferPaymentTypeFromAddress(address);

    const accountIndex = whenSupportedPaymentType(paymentType)({
      p2tr: taprootKeychain.index - HARDENED_OFFSET,
      p2wpkh: nativeSegwitKeychain.index - HARDENED_OFFSET,
    });

    function getTaprootAddressAtIndex(index: number) {
      return getTaprootAddress({ index, keychain: taprootKeychain, network });
    }

    function getNativeSegwitAddressAtIndex(index: number) {
      return getNativeSegwitAddress({ index, keychain: nativeSegwitKeychain, network });
    }

    const paymentFn = whenSupportedPaymentType(paymentType)({
      p2tr: getTaprootAddressAtIndex,
      p2wpkh: getNativeSegwitAddressAtIndex,
    });

    const derivationPathFn = whenSupportedPaymentType(paymentType)({
      p2tr: makeTaprootAddressIndexDerivationPath,
      p2wpkh: makeNativeSegwitAddressIndexDerivationPath,
    });

    const count = createCounter();
    const t0 = performance.now();

    while (count.getValue() <= iterationLimit) {
      const currentIndex = count.getValue();

      const addressToCheck = paymentFn(currentIndex);

      if (addressToCheck !== address) {
        count.increment();
        continue;
      }

      const t1 = performance.now();

      return {
        status: 'success',
        duration: t1 - t0,
        path: derivationPathFn(network, accountIndex, currentIndex),
      } as const;
    }

    return { status: 'failure' } as const;
  };
}
