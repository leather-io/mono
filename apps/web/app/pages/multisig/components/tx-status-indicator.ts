import { assertUnreachable } from '@leather.io/utils';

import type { TxStatus } from '../data/multisig-types';

export type TxIndicatorKind = 'sent' | 'failed';

export function txStatusToIndicatorKind(status: TxStatus): TxIndicatorKind {
  switch (status) {
    case 'failed':
    case 'dropped':
    case 'cancelled':
      return 'failed';
    case 'pending':
    case 'queued':
    case 'signed':
    case 'broadcast':
    case 'confirmed':
      return 'sent';
    default:
      return assertUnreachable(status);
  }
}
