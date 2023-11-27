import { BitcoinAccount } from '@leather-wallet/bitcoin/src/bitcoin.utils';
import { getTaprootPaymentFromAddressIndex } from '@leather-wallet/bitcoin/src/p2tr-address-gen';
import { NetworkConfiguration } from '@leather-wallet/constants';
import { Versions } from '@scure/bip32';

import { bitcoinAddressIndexSignerFactory } from './bitcoin-signer';

function getTaprootSigner({
  currentAccountIndex,
  taprootAccount,
  currentNetwork,
  bitcoinExtendedPublicKeyVersions,
}: {
  currentAccountIndex: number;
  taprootAccount: BitcoinAccount | undefined;
  currentNetwork: NetworkConfiguration;
  bitcoinExtendedPublicKeyVersions: Versions | undefined;
}) {
  if (!taprootAccount) return;
  return bitcoinAddressIndexSignerFactory({
    accountIndex: currentAccountIndex,
    accountKeychain: taprootAccount.keychain,
    paymentFn: getTaprootPaymentFromAddressIndex,
    // TODO: Can we use taprootAccount.network here?
    network: currentNetwork.chain.bitcoin.bitcoinNetwork,
    extendedPublicKeyVersions: bitcoinExtendedPublicKeyVersions,
  });
}

export function getCurrentAccountTaprootIndexZeroSigner({
  currentAccountIndex,
  taprootAccount,
  currentNetwork,
  bitcoinExtendedPublicKeyVersions,
}: {
  currentAccountIndex: number;
  taprootAccount: BitcoinAccount | undefined;
  currentNetwork: NetworkConfiguration;
  bitcoinExtendedPublicKeyVersions: Versions | undefined;
}) {
  const signer = getTaprootSigner({
    currentAccountIndex,
    taprootAccount,
    currentNetwork,
    bitcoinExtendedPublicKeyVersions,
  });
  if (!signer) throw new Error('No signer');
  return signer(0);
}
