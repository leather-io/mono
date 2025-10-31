// TODO: move this somewhere else, it's not a good place for it
import { getStacksNetworkMode } from '@/queries/leather-query-provider';

import { HIRO_EXPLORER_URL } from '@leather.io/constants';
import { CryptoAsset, NetworkConfiguration } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

export type BitcoinNetworkPreference = 'mainnet' | 'testnet4' | 'signet';
type StacksNetworkPreference = 'mainnet' | 'testnet';

interface MakeActivityArgs {
  txid: string;
  networkPreference: NetworkConfiguration;
  asset?: CryptoAsset;
}
export function makeActivityLink({ txid, networkPreference, asset }: MakeActivityArgs) {
  if (txid && asset) {
    return makeActivityExplorerLink({
      asset,
      txid,
      networkPreference,
    });
  }
  return null;
}

interface MakeActivityExplorerLinkArgs {
  asset: CryptoAsset;
  txid: string;
  networkPreference: NetworkConfiguration;
}
function makeActivityExplorerLink({
  asset,
  txid,
  networkPreference,
}: MakeActivityExplorerLinkArgs) {
  if (asset.chain === 'bitcoin') {
    return getMempoolExplorerLink({
      networkPreference: networkPreference.chain.bitcoin.bitcoinNetwork as BitcoinNetworkPreference,
      id: txid,
      type: 'txid',
    });
  }
  return makeStacksTxExplorerLink({
    networkPreference: getStacksNetworkMode(networkPreference),
    searchParams: undefined,
    txid,
  });
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

interface getMempoolExplorerLinkArgs {
  id: string;
  type: 'txid' | 'block';
  networkPreference: BitcoinNetworkPreference;
}

export function getMempoolExplorerLink({
  id,
  type,
  networkPreference,
}: getMempoolExplorerLinkArgs) {
  const mempoolBaseUrl = 'https://mempool.space';

  switch (networkPreference) {
    case 'mainnet':
      return `${mempoolBaseUrl}/${type}/${id}`;
    case 'testnet4':
      return `${mempoolBaseUrl}/testnet4/${type}/${id}`;
    case 'signet':
      return `${mempoolBaseUrl}/signet/${type}/${id}`;
    default:
      assertUnreachable(networkPreference);
  }
}
