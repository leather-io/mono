import { BitcoinAccount } from '@leather-wallet/bitcoin/src/bitcoin.utils';
import { getNativeSegWitPaymentFromAddressIndex } from '@leather-wallet/bitcoin/src/p2wpkh-address-gen';
import { NetworkConfiguration } from '@leather-wallet/constants';

import { KeyConfig } from '../useWalletType';
import { useBitcoinExtendedPublicKeyVersions } from './bitcoin-keychain';
import { bitcoinAddressIndexSignerFactory } from './bitcoin-signer';

function useNativeSegwitSigner({
  currentAccountIndex,
  segwitAccount,
  currentNetwork,
  hasLedgerKeys,
  wallet,
}: {
  currentAccountIndex: number;
  segwitAccount: BitcoinAccount | undefined;
  currentNetwork: NetworkConfiguration;
  hasLedgerKeys: boolean;
  wallet: KeyConfig | undefined;
}) {
  const extendedPublicKeyVersions = useBitcoinExtendedPublicKeyVersions({
    currentNetwork,
    hasLedgerKeys,
    wallet,
  });
  if (!segwitAccount) return;

  return bitcoinAddressIndexSignerFactory({
    accountIndex: currentAccountIndex,
    accountKeychain: segwitAccount.keychain,
    paymentFn: getNativeSegWitPaymentFromAddressIndex,
    network: segwitAccount.network,
    extendedPublicKeyVersions,
  });
}

export function useCurrentAccountNativeSegwitIndexZeroSigner({
  currentAccountIndex,
  segwitAccount,
  currentNetwork,
  hasLedgerKeys,
  wallet,
}: {
  currentAccountIndex: number;
  segwitAccount: BitcoinAccount | undefined;
  currentNetwork: NetworkConfiguration;
  hasLedgerKeys: boolean;
  wallet: KeyConfig | undefined;
}) {
  const signer = useNativeSegwitSigner({
    currentAccountIndex,
    segwitAccount,
    currentNetwork,
    hasLedgerKeys,
    wallet,
  });
  if (!signer) throw new Error('No signer');
  return signer(0);
}
