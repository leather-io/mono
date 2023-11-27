import { BitcoinAccount } from '@leather-wallet/bitcoin/src/bitcoin.utils';
import { getNativeSegWitPaymentFromAddressIndex } from '@leather-wallet/bitcoin/src/p2wpkh-address-gen';
import { Versions } from '@scure/bip32';

import { bitcoinAddressIndexSignerFactory } from './bitcoin-signer';

function getNativeSegwitSigner({
  currentAccountIndex,
  nativeSegwitAccount,
  bitcoinExtendedPublicKeyVersions,
}: {
  currentAccountIndex: number;
  nativeSegwitAccount: BitcoinAccount | undefined;
  bitcoinExtendedPublicKeyVersions: Versions | undefined;
}) {
  if (!nativeSegwitAccount) return;

  return bitcoinAddressIndexSignerFactory({
    accountIndex: currentAccountIndex,
    accountKeychain: nativeSegwitAccount.keychain,
    paymentFn: getNativeSegWitPaymentFromAddressIndex,
    network: nativeSegwitAccount.network,
    extendedPublicKeyVersions: bitcoinExtendedPublicKeyVersions,
  });
}

export function getCurrentAccountNativeSegwitIndexZeroSigner({
  currentAccountIndex,
  nativeSegwitAccount,
  bitcoinExtendedPublicKeyVersions,
}: {
  currentAccountIndex: number;
  nativeSegwitAccount: BitcoinAccount | undefined;
  bitcoinExtendedPublicKeyVersions: Versions | undefined;
}) {
  const signer = getNativeSegwitSigner({
    currentAccountIndex,
    nativeSegwitAccount,
    bitcoinExtendedPublicKeyVersions,
  });
  if (!signer) throw new Error('No signer');
  return signer(0);
}
