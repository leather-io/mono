import { NetworkMode } from '~/features/stacking/utils/stacking-network-types';

import { StacksClient } from '@leather.io/query';

export interface CreateProtocolFeeQueryOptionsParams {
  address?: string;
  client: StacksClient;
  networkMode: NetworkMode;
}
