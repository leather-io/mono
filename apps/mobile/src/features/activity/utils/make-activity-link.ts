// TODO: move this somewhere else, it's not a good place for it
import { getStacksNetworkMode } from '@/queries/leather-query-provider';

import { HIRO_EXPLORER_URL } from '@leather.io/constants';
import { NetworkConfiguration, SupportedBlockchains } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

export type BitcoinNetworkPreference = 'mainnet' | 'testnet4' | 'signet';
type StacksNetworkPreference = 'mainnet' | 'testnet';

interface MakeActivityArgs {
  txid: string;
  networkPreference: NetworkConfiguration;
  chain: SupportedBlockchains;
}
export function makeActivityLink({ txid, networkPreference, chain }: MakeActivityArgs) {
  if (txid && chain) {
    return makeActivityExplorerLink({
      chain,
      txid,
      networkPreference,
    });
  }
  return null;
}

interface MakeActivityExplorerLinkArgs {
  chain: SupportedBlockchains;
  txid: string;
  networkPreference: NetworkConfiguration;
}
function makeActivityExplorerLink({
  chain,
  txid,
  networkPreference,
}: MakeActivityExplorerLinkArgs) {
  if (chain === 'bitcoin') {
    return getMempoolExplorerLink({
      networkPreference: networkPreference.chain.bitcoin.bitcoinNetwork as BitcoinNetworkPreference,
      id: txid,
      type: 'tx',
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
  type: 'tx' | 'block';
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
