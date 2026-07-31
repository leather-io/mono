import { BitcoinStakingPool, getPoolBySignerManager } from '~/data/bitcoin-staking-data';

import { Pox5StakerInfo } from '../queries/create-get-pox5-staker-info-query-options';
import { PendingPox5Tx } from '../queries/get-pending-pox5-txs';
import { usePox5PendingTxQuery, usePox5StakerInfoQuery } from '../queries/pox5-stacking.query';

export type Pox5Position =
  | { status: 'none' }
  | { status: 'pending-stake'; pendingTx: PendingPox5Tx }
  | {
      status: 'active';
      info: Pox5StakerInfo;
      // null means the signer-manager is not one of our listed pools (custom pool)
      pool: BitcoinStakingPool | null;
      pendingTx: PendingPox5Tx | null;
    };

interface UsePox5PositionResult {
  isLoading: boolean;
  position: Pox5Position;
}

// The pox-5 replacement for the delegation-status model: pool identity comes
// straight from the position's signer principal, with an optimistic overlay for
// transactions still in the mempool.
export function usePox5Position(): UsePox5PositionResult {
  const stakerInfoQuery = usePox5StakerInfoQuery();
  const pendingTxQuery = usePox5PendingTxQuery();

  const info = stakerInfoQuery.data ?? null;
  const pendingTx = pendingTxQuery.data ?? null;
  const isLoading = stakerInfoQuery.isLoading || pendingTxQuery.isLoading;

  if (info) {
    return {
      isLoading,
      position: {
        status: 'active',
        info,
        pool: getPoolBySignerManager(info.signerManagerContractId) ?? null,
        pendingTx,
      },
    };
  }

  if (pendingTx?.kind === 'stake') {
    return { isLoading, position: { status: 'pending-stake', pendingTx } };
  }

  return { isLoading, position: { status: 'none' } };
}
