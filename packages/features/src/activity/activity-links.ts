import { HIRO_EXPLORER_URL, MEMPOOL_BASE_URL } from '@leather.io/constants';
import {
  type BitcoinNetwork,
  type BitcoinNetworkModes,
  ChainId,
  type CryptoAsset,
  HIRO_API_BASE_URL_MAINNET,
  HIRO_API_BASE_URL_NAKAMOTO_TESTNET,
  HIRO_API_BASE_URL_TESTNET,
  type NetworkConfiguration,
  isPublicMempoolUrl,
} from '@leather.io/models';

interface MakeActivityLinkArgs {
  txid: string;
  networkPreference: NetworkConfiguration;
  asset?: CryptoAsset;
}

export function makeActivityLink({ txid, networkPreference, asset }: MakeActivityLinkArgs) {
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
    return getBitcoinExplorerLink({
      networkPreference: networkPreference.chain.bitcoin.bitcoinNetwork,
      bitcoinUrl: networkPreference.chain.bitcoin.bitcoinUrl,
      id: txid,
      type: 'tx',
    });
  }
  return getStacksExplorerLink({
    mode: getStacksExplorerMode(networkPreference),
    type: 'txid',
    value: txid,
    searchParams: undefined,
    isNakamoto: false,
    stacksApiUrl: networkPreference.chain.stacks.url,
  });
}

export interface GetMempoolExplorerLinkArgs {
  id: string;
  type: 'tx' | 'block' | 'address';
  networkPreference: BitcoinNetwork;
  bitcoinUrl?: string;
}

// A url with no api path is a bitcoind rpc endpoint, which has no explorer.
function selfHostedExplorerBaseUrl(bitcoinUrl: string) {
  const base = bitcoinUrl.replace(/\/api(\/proxy)?\/?$/, '');
  return base === bitcoinUrl ? null : base;
}

export function getBitcoinExplorerLink({
  id,
  type,
  networkPreference,
  bitcoinUrl,
}: GetMempoolExplorerLinkArgs) {
  if (bitcoinUrl && !isPublicMempoolUrl(bitcoinUrl)) {
    const base = selfHostedExplorerBaseUrl(bitcoinUrl);
    return base ? `${base}/${type}/${id}` : null;
  }
  switch (networkPreference) {
    case 'mainnet':
      return `${MEMPOOL_BASE_URL}/${type}/${id}`;
    case 'testnet3':
      return `${MEMPOOL_BASE_URL}/testnet/${type}/${id}`;
    case 'testnet4':
      return `${MEMPOOL_BASE_URL}/testnet4/${type}/${id}`;
    case 'signet':
      return `${MEMPOOL_BASE_URL}/signet/${type}/${id}`;
    default:
      return null;
  }
}

interface GetHiroExplorerLinkArgs {
  mode: BitcoinNetworkModes;
  type: 'txid' | 'address';
  value: string;
  searchParams?: URLSearchParams;
  isNakamoto?: boolean;
  stacksApiUrl?: string;
}

export function getStacksExplorerMode(network: NetworkConfiguration): BitcoinNetworkModes {
  if (network.chain.bitcoin.mode === 'regtest') return 'regtest';
  return network.chain.stacks.chainId === ChainId.Mainnet ? 'mainnet' : 'testnet';
}

const defaultStacksApiUrls: Partial<Record<BitcoinNetworkModes, string>> = {
  mainnet: HIRO_API_BASE_URL_MAINNET,
  testnet: HIRO_API_BASE_URL_TESTNET,
};

function withoutTrailingSlash(url: string) {
  return url.replace(/\/+$/, '');
}

function getCustomStacksApiUrl(mode: BitcoinNetworkModes, stacksApiUrl: string | undefined) {
  const defaultUrl = defaultStacksApiUrls[mode];
  if (!stacksApiUrl || !defaultUrl) return null;
  const url = withoutTrailingSlash(stacksApiUrl);
  return url === defaultUrl ? null : url;
}

export function getStacksExplorerLink({
  mode,
  type,
  value,
  searchParams = new URLSearchParams(),
  isNakamoto = false,
  stacksApiUrl,
}: GetHiroExplorerLinkArgs) {
  if (mode === 'regtest' && type === 'txid') return `http://localhost:8000/txid/${value}`;
  searchParams.append('chain', mode);
  const apiUrl = isNakamoto
    ? HIRO_API_BASE_URL_NAKAMOTO_TESTNET
    : getCustomStacksApiUrl(mode, stacksApiUrl);
  if (apiUrl) searchParams.append('api', apiUrl);
  return `${HIRO_EXPLORER_URL}/${type}/${value}?${searchParams.toString()}`;
}
