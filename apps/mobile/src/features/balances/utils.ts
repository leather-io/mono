import { FetchState } from '@/components/loading';

import { QuotedStxBalance } from '@leather.io/services';

export function isStacking(stxBalance: FetchState<QuotedStxBalance>) {
  return stxBalance.state === 'success' && stxBalance.value.stx.lockedBalance.amount.gt(0);
}
