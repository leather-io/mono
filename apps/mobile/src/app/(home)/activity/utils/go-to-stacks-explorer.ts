import { Linking } from 'react-native';

import { BitcoinNetworkModes } from '@leather.io/models';
import { makeStacksTxExplorerLink } from '@leather.io/utils';

export async function goToStacksExplorer(txid: string, mode: BitcoinNetworkModes) {
  const url = makeStacksTxExplorerLink({
    mode,
    searchParams: undefined,
    txid,
  });
  return await Linking.openURL(url);
}
