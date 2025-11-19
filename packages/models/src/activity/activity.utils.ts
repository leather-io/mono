import { CryptoAsset } from '../assets/asset.model';
import { ChainId, NetworkConfiguration } from '../network/network.model';

export type BitcoinNetworkPreference = 'mainnet' | 'testnet4' | 'signet';
type StacksNetworkPreference = 'mainnet' | 'testnet';

const HIRO_EXPLORER_URL = 'https://explorer.hiro.so';
const MEMPOOL_BASE_URL = 'https://mempool.space';

export interface MakeActivityArgs {
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
    networkPreference:
      networkPreference.chain.stacks.chainId === ChainId.Testnet ? 'testnet' : 'mainnet',
    searchParams: undefined,
    txid,
    explorerUrl: HIRO_EXPLORER_URL,
  });
}

interface MakeStacksTxExplorerLinkArgs {
  networkPreference: StacksNetworkPreference;
  searchParams?: URLSearchParams;
  txid: string;
  explorerUrl: string;
}
function makeStacksTxExplorerLink({
  networkPreference,
  searchParams = new URLSearchParams(),
  txid,
  explorerUrl,
}: MakeStacksTxExplorerLinkArgs) {
  searchParams.append('chain', networkPreference);
  return `${explorerUrl}/txid/${txid}?${searchParams.toString()}`;
}

export interface GetMempoolExplorerLinkArgs {
  id: string;
  type: 'txid' | 'block';
  networkPreference: BitcoinNetworkPreference;
}

export function getMempoolExplorerLink({
  id,
  type,
  networkPreference,
}: GetMempoolExplorerLinkArgs) {
  switch (networkPreference) {
    case 'mainnet':
      return `${MEMPOOL_BASE_URL}/${type}/${id}`;
    case 'testnet4':
      return `${MEMPOOL_BASE_URL}/testnet4/${type}/${id}`;
    case 'signet':
      return `${MEMPOOL_BASE_URL}/signet/${type}/${id}`;
    default:
      return null;
  }
}
