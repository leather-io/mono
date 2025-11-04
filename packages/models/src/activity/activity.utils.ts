import { CryptoAsset } from '../assets/asset.model';
import { ChainId, NetworkConfiguration } from '../network/network.model';

export type BitcoinNetworkPreference = 'mainnet' | 'testnet4' | 'signet';
type StacksNetworkPreference = 'mainnet' | 'testnet';

export interface MakeActivityArgs {
  txid: string;
  networkPreference: NetworkConfiguration;
  asset?: CryptoAsset;
  explorerUrl: string;
}
export function makeActivityLink({
  txid,
  networkPreference,
  asset,
  explorerUrl,
}: MakeActivityArgs) {
  if (txid && asset) {
    return makeActivityExplorerLink({
      asset,
      txid,
      networkPreference,
      explorerUrl,
    });
  }
  return null;
}

interface MakeActivityExplorerLinkArgs {
  asset: CryptoAsset;
  txid: string;
  networkPreference: NetworkConfiguration;
  explorerUrl: string;
}
function makeActivityExplorerLink({
  asset,
  txid,
  networkPreference,
  explorerUrl,
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
    explorerUrl,
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
  const mempoolBaseUrl = 'https://mempool.space';

  switch (networkPreference) {
    case 'mainnet':
      return `${mempoolBaseUrl}/${type}/${id}`;
    case 'testnet4':
      return `${mempoolBaseUrl}/testnet4/${type}/${id}`;
    case 'signet':
      return `${mempoolBaseUrl}/signet/${type}/${id}`;
    default:
      return null;
  }
}
