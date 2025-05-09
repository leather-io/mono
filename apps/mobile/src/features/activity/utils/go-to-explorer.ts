import { Linking } from 'react-native';

import { BitcoinNetworkModes, CryptoAssetChain, CryptoAssetInfo } from '@leather.io/models';
import { makeBitcoinTxExplorerLink, makeStacksTxExplorerLink } from '@leather.io/utils';

interface GoToExplorerArgs {
  activityChain: CryptoAssetChain;
  txid: string;
  mode: BitcoinNetworkModes;
}

export async function goToExplorer({ activityChain, txid, mode }: GoToExplorerArgs) {
  const url =
    activityChain === 'stacks'
      ? makeStacksTxExplorerLink({
          mode,
          searchParams: undefined,
          txid,
        })
      : makeBitcoinTxExplorerLink({
          txid,
          bitcoin: { bitcoinUrl, bitcoinNetwork },
        });
  return await Linking.openURL(url);
}
