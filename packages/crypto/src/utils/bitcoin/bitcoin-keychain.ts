import {
  bitcoinNetworkModeToCoreNetworkMode,
  getHdKeyVersionsFromNetwork,
} from '@leather-wallet/bitcoin/src/bitcoin.utils';
import { NetworkConfiguration } from '@leather-wallet/constants';
import { Versions } from '@scure/bip32';

import { KeyConfig, useWalletType } from '../useWalletType';

export function useBitcoinExtendedPublicKeyVersions({
  currentNetwork,
  hasLedgerKeys,
  wallet,
}: {
  currentNetwork: NetworkConfiguration;
  hasLedgerKeys: boolean;
  wallet: KeyConfig | undefined;
}): Versions | undefined {
  const { whenWallet } = useWalletType({ hasLedgerKeys, wallet });
  // Only Ledger in testnet mode do we need to manually declare `Versions`
  return whenWallet({
    software: undefined,
    ledger: getHdKeyVersionsFromNetwork(
      bitcoinNetworkModeToCoreNetworkMode(currentNetwork.chain.bitcoin.bitcoinNetwork)
    ),
  });
}
