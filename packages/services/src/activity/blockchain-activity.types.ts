import type { AccountAddresses, BlockchainActivity } from '@leather.io/models';

import type { ActivitySourceCursor } from './activity-paginator';

export interface ActivityRequest {
  account: AccountAddresses;
  cursor?: ActivitySourceCursor;
  limit?: number;
}

export interface ActivityResponse {
  items: BlockchainActivity[];
  nextCursor: ActivitySourceCursor | null;
  hasMore: boolean;
}
