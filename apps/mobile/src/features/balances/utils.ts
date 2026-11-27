import { type FetchState } from '@/queries/fetch-state';

import { type QuotedStxBalance } from '@leather.io/services';

export function isStacking(stxBalance: FetchState<QuotedStxBalance>) {
  return stxBalance.state === 'success' && stxBalance.value.stx.lockedBalance.amount.gt(0);
}
