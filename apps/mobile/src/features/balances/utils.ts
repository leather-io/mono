import { type FetchState } from '@/components/loading';

import { type QuotedStxBalance } from '@leather.io/services';

export function isStacking(stxBalance: FetchState<QuotedStxBalance>) {
  return stxBalance.state === 'success' && stxBalance.value.stx.lockedBalance.amount.gt(0);
}
