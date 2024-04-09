import { useMemo } from 'react';

import { createMoney, increaseValueByOneMicroStx, microStxToStx } from '@leather-wallet/utils';
import {
  MempoolTokenTransferTransaction,
  MempoolTransaction,
} from '@stacks/stacks-blockchain-api-types';
import BigNumber from 'bignumber.js';

import { useTransactionsById } from '../transactions/transactions-by-id.query';
import { useStacksConfirmedTransactions } from '../transactions/transactions-with-transfers.hooks';
import { useAccountMempoolQuery } from './mempool.query';

const droppedCache = new Map();

function useAccountMempoolTransactions(address: string) {
  // const analytics = useAnalytics();
  const query = useAccountMempoolQuery(address);
  const accountMempoolTxs = query.data;
  const mempoolTxs = (accountMempoolTxs ? accountMempoolTxs.results : []) as MempoolTransaction[];
  const results = mempoolTxs.filter(
    tx => tx.tx_status === 'pending' && !droppedCache.has(tx.tx_id)
  );
  const txs = useTransactionsById(results.map(tx => tx.tx_id));
  return useMemo(() => {
    return {
      query,
      transactions: txs
        .map(tx => tx.data)
        .filter(tx => {
          if (typeof tx === 'undefined') return false;
          if (droppedCache.has(tx.tx_id)) return false;
          if (tx.tx_status !== 'pending') {
            // Stale txs persist in the mempool endpoint so we
            // need to cache dropped txids to prevent unneeded fetches
            // void analytics.track('transaction_added_to_dropped_cache');
            droppedCache.set(tx.tx_id, true);
            return false;
          }
          return true;
        }),
    };
  }, [txs, query]);
}

export function useStacksPendingTransactions({ stacksAddress }: { stacksAddress: string }) {
  const { query, transactions } = useAccountMempoolTransactions(stacksAddress ?? '');
  return useMemo(() => {
    const nonEmptyTransactions = transactions.filter(tx => !!tx) as MempoolTransaction[];
    return { query, transactions: nonEmptyTransactions };
  }, [query, transactions]);
}

export function useCurrentAccountMempoolTransactionsBalance({
  stacksAddress,
}: {
  stacksAddress: string;
}) {
  const { transactions: pendingTransactions } = useStacksPendingTransactions({ stacksAddress });
  const confirmedTxs = useStacksConfirmedTransactions({ stacksAddress });

  const pendingOutboundTxs = pendingTransactions.filter(tx => {
    if (confirmedTxs.some(confirmedTx => confirmedTx.nonce === tx.nonce)) {
      return false;
    }
    return tx.tx_type === 'token_transfer' && tx.sender_address === stacksAddress;
  }) as unknown as MempoolTokenTransferTransaction[];

  const tokenTransferTxsBalance = pendingOutboundTxs.reduce(
    (acc, tx) => acc.plus(tx.token_transfer.amount),
    new BigNumber(0)
  );
  const pendingTxsFeesBalance = pendingOutboundTxs.reduce(
    (acc, tx) => acc.plus(tx.fee_rate),
    new BigNumber(0)
  );

  return createMoney(tokenTransferTxsBalance.plus(pendingTxsFeesBalance), 'STX');
}

export function useStacksValidateFeeByNonce({ stacksAddress }: { stacksAddress: string }) {
  const { transactions } = useStacksPendingTransactions({ stacksAddress });

  function changeFeeByNonce({ nonce, fee }: { nonce: number; fee: number }) {
    return transactions.reduce((updatedFee, tx) => {
      if (Number(tx.nonce) === nonce && microStxToStx(tx.fee_rate).toNumber() >= fee) {
        return increaseValueByOneMicroStx(microStxToStx(tx.fee_rate));
      }
      return updatedFee;
    }, fee);
  }
  return { changeFeeByNonce };
}
