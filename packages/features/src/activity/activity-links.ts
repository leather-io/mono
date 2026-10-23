import { HIRO_EXPLORER_URL, MEMPOOL_BASE_URL } from '@leather.io/constants';
import {
  type BitcoinNetwork,
  type BitcoinNetworkModes,
  type CryptoAsset,
  HIRO_API_BASE_URL_MAINNET,
  HIRO_API_BASE_URL_NAKAMOTO_TESTNET,
  HIRO_API_BASE_URL_TESTNET,
  type NetworkConfiguration,
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
    mode: networkPreference.chain.bitcoin.mode,
    type: 'txid',
    value: txid,
    searchParams: undefined,
    isNakamoto: false,
    apiUrl: getStacksExplorerApiUrl(networkPreference.chain.stacks.url),
  });
}

export interface GetMempoolExplorerLinkArgs {
  id: string;
  type: 'tx' | 'block';
  networkPreference: BitcoinNetwork;
  bitcoinUrl?: string;
}

const publicMempoolHosts = ['mempool.space', 'leather.mempool.space'];

function isSelfHostedMempoolUrl(bitcoinUrl: string | undefined): bitcoinUrl is string {
  if (!bitcoinUrl) return false;
  const host = /^https?:\/\/([^/:?#]+)/.exec(bitcoinUrl)?.[1];
  return host !== undefined && !publicMempoolHosts.includes(host);
}

// A url with no api path is a bitcoind rpc endpoint, which has no explorer.
function mempoolExplorerBaseUrl(bitcoinUrl: string | undefined) {
  if (!bitcoinUrl) return null;
  const base = bitcoinUrl.replace(/\/api(\/proxy)?\/?$/, '');
  return base === bitcoinUrl ? null : base;
}

export function getBitcoinExplorerLink({
  id,
  type,
  networkPreference,
  bitcoinUrl,
}: GetMempoolExplorerLinkArgs) {
  if (isSelfHostedMempoolUrl(bitcoinUrl)) {
    const base = mempoolExplorerBaseUrl(bitcoinUrl);
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
    case 'regtest': {
      const base = mempoolExplorerBaseUrl(bitcoinUrl);
      return base ? `${base}/${type}/${id}` : null;
    }
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
  apiUrl?: string;
}

const hiroPublicApiUrls = [HIRO_API_BASE_URL_MAINNET, HIRO_API_BASE_URL_TESTNET];

export function getStacksExplorerApiUrl(stacksUrl: string) {
  return hiroPublicApiUrls.includes(stacksUrl) ? undefined : stacksUrl;
}

function toHiroExplorerChain(mode: BitcoinNetworkModes) {
  return mode === 'signet' ? 'testnet' : mode;
}

export function getStacksExplorerLink({
  mode,
  type,
  value,
  searchParams = new URLSearchParams(),
  isNakamoto = false,
  apiUrl,
}: GetHiroExplorerLinkArgs) {
  if (mode === 'regtest' && type === 'txid') return `http://localhost:8000/txid/${value}`;
  searchParams.append('chain', toHiroExplorerChain(mode));
  const explorerApiUrl = apiUrl ?? (isNakamoto ? HIRO_API_BASE_URL_NAKAMOTO_TESTNET : undefined);
  if (explorerApiUrl) searchParams.append('api', explorerApiUrl);
  return `${HIRO_EXPLORER_URL}/${type}/${value}?${searchParams.toString()}`;
}
