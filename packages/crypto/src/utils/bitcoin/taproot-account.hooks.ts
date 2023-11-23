import { BitcoinAccount } from '@leather-wallet/bitcoin/src/bitcoin.utils';
import { getTaprootPaymentFromAddressIndex } from '@leather-wallet/bitcoin/src/p2tr-address-gen';
import { NetworkConfiguration } from '@leather-wallet/constants';

import { KeyConfig } from '../useWalletType';
import { useBitcoinExtendedPublicKeyVersions } from './bitcoin-keychain';
import { bitcoinAddressIndexSignerFactory } from './bitcoin-signer';

function useTaprootSigner({
  currentAccountIndex,
  taprootAccount,
  currentNetwork,
  hasLedgerKeys,
  wallet,
}: {
  currentAccountIndex: number;
  taprootAccount: BitcoinAccount | undefined;
  currentNetwork: NetworkConfiguration;
  hasLedgerKeys: boolean;
  wallet: KeyConfig | undefined;
}) {
  const extendedPublicKeyVersions = useBitcoinExtendedPublicKeyVersions({
    currentNetwork,
    hasLedgerKeys,
    wallet,
  });

  if (!taprootAccount) return; // TODO: Revisit this return early
  return bitcoinAddressIndexSignerFactory({
    accountIndex: currentAccountIndex,
    accountKeychain: taprootAccount.keychain,
    paymentFn: getTaprootPaymentFromAddressIndex,
    network: currentNetwork.chain.bitcoin.bitcoinNetwork,
    extendedPublicKeyVersions,
  });
}

export function useCurrentAccountTaprootIndexZeroSigner({
  currentAccountIndex,
  taprootAccount,
  currentNetwork,
  hasLedgerKeys,
  wallet,
}: {
  currentAccountIndex: number;
  taprootAccount: BitcoinAccount | undefined;
  currentNetwork: NetworkConfiguration;
  hasLedgerKeys: boolean;
  wallet: KeyConfig | undefined;
}) {
  const signer = useTaprootSigner({
    currentAccountIndex,
    taprootAccount,
    currentNetwork,
    hasLedgerKeys,
    wallet,
  });
  if (!signer) throw new Error('No signer');
  return signer(0);
}
