import type {
  AccountAddresses,
  BlockchainActivity,
  CryptoAsset,
  CryptoAssetChain,
  StacksProtocolId,
} from '@leather.io/models';

interface ActivityFilter {
  asset?: CryptoAsset;
  protocol?: StacksProtocolId;
  chain?: CryptoAssetChain;
}

interface ActivityPagination {
  limit: number;
  offset: number;
}

export interface ActivityRequest {
  account: AccountAddresses;
  filter?: ActivityFilter;
  pagination?: ActivityPagination;
}

export interface ActivityMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface ActivityResponse {
  items: BlockchainActivity[];
  meta: ActivityMeta;
}
