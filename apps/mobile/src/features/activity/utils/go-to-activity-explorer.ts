import { Linking } from 'react-native';

// TODO: move this somewhere else, it's not a good place for it
import { getStacksNetworkMode } from '@/queries/leather-query-provider';

import { HIRO_EXPLORER_URL } from '@leather.io/constants';
import { CryptoAssetInfo, NetworkConfiguration } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

/**
 * TODO:  Share better with extension
 *  Duplicating this code from the extension now to:
 *  - exclude 'regtest' because we don't support it in mobile yet
 *  - remove the 'isNakamoto' parameter
 *  - avoid refactoring the extension code useCurrentNetworkState
 */
// these are the only networks we support in mobile
type BitcoinNetworkPreference = 'mainnet' | 'testnet4' | 'signet';
type StacksNetworkPreference = 'mainnet' | 'testnet';

interface OnPressActivityArgs {
  txid: string;
  networkPreference: NetworkConfiguration;
  asset?: CryptoAssetInfo;
}
export function onPressActivity({ txid, networkPreference, asset }: OnPressActivityArgs) {
  if (txid && asset) {
    goToActivityExplorer({
      asset,
      txid,
      networkPreference,
    });
  }
}

interface GoToActivityExplorerArgs {
  asset: CryptoAssetInfo;
  txid: string;
  networkPreference: NetworkConfiguration;
}
export async function goToActivityExplorer({
  asset,
  txid,
  networkPreference,
}: GoToActivityExplorerArgs) {
  if (asset.chain === 'bitcoin') {
    return await goMempoolExplorer(
      txid,
      networkPreference.chain.bitcoin.bitcoinNetwork as BitcoinNetworkPreference
    );
  }
  return await goToStacksExplorer(txid, getStacksNetworkMode(networkPreference));
}

async function goToStacksExplorer(txid: string, networkPreference: StacksNetworkPreference) {
  const url = makeStacksTxExplorerLink({
    networkPreference,
    searchParams: undefined,
    txid,
  });
  return await Linking.openURL(url);
}

async function goMempoolExplorer(txid: string, networkPreference: BitcoinNetworkPreference) {
  const url = makeMempoolExplorerLink({
    networkPreference,
    txid,
  });
  return await Linking.openURL(url);
}

interface MakeStacksTxExplorerLinkArgs {
  networkPreference: StacksNetworkPreference;
  searchParams?: URLSearchParams;
  txid: string;
}
function makeStacksTxExplorerLink({
  networkPreference,
  searchParams = new URLSearchParams(),
  txid,
}: MakeStacksTxExplorerLinkArgs) {
  searchParams.append('chain', networkPreference);
  return `${HIRO_EXPLORER_URL}/txid/${txid}?${searchParams.toString()}`;
}

interface MakeMempoolExplorerLinkArgs {
  txid: string;
  networkPreference: BitcoinNetworkPreference;
}
function makeMempoolExplorerLink({ txid, networkPreference }: MakeMempoolExplorerLinkArgs) {
  const mempoolBaseUrl = 'https://mempool.space';

  switch (networkPreference) {
    case 'mainnet':
      return `${mempoolBaseUrl}/tx/${txid}`;
    case 'testnet4':
      return `${mempoolBaseUrl}/testnet4/tx/${txid}`;
    case 'signet':
      return `${mempoolBaseUrl}/signet/tx/${txid}`;
    default:
      assertUnreachable(networkPreference);
  }
}
