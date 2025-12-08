import { HIRO_EXPLORER_URL, MEMPOOL_BASE_URL } from '@leather.io/constants';
import {
  type BitcoinNetwork,
  type BitcoinNetworkModes,
  type CryptoAsset,
  HIRO_API_BASE_URL_NAKAMOTO_TESTNET,
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
  });
}

export interface GetMempoolExplorerLinkArgs {
  id: string;
  type: 'tx' | 'block';
  networkPreference: BitcoinNetwork;
}

export function getBitcoinExplorerLink({
  id,
  type,
  networkPreference,
}: GetMempoolExplorerLinkArgs) {
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
}

export function getStacksExplorerLink({
  mode,
  type,
  value,
  searchParams = new URLSearchParams(),
  isNakamoto = false,
}: GetHiroExplorerLinkArgs) {
  if (mode === 'regtest' && type === 'txid') return `http://localhost:8000/txid/${value}`;
  searchParams.append('chain', mode);
  if (isNakamoto) searchParams.append('api', HIRO_API_BASE_URL_NAKAMOTO_TESTNET);
  return `${HIRO_EXPLORER_URL}/${type}/${value}?${searchParams.toString()}`;
}
