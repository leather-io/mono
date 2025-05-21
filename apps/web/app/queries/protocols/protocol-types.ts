import { NetworkMode } from '~/features/stacking/start-pooled-stacking/utils/stacking-pool-types';

import { StacksClient } from '@leather.io/query';

export interface CreateProtocolBalanceQueryOptionsParams {
  address?: string;
  client: StacksClient;
  networkUrl: string;
  networkMode: NetworkMode;
}

export interface CreateProtocolFeeQueryOptionsParams {
  address?: string;
  client: StacksClient;
  networkMode: NetworkMode;
}
