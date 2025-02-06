import { useStxTotalBalance } from '@/queries/balance/stx-balance.query';
import { FetchState, toFetchState } from '@/shared/fetch-state';

import { Money } from '@leather.io/models';
import {
  BtcAggregateBalance,
  RunesAggregateBalance,
  Sip10AggregateBalance,
  StxAggregateBalance,
} from '@leather.io/services';
import { createMoney, isDefined, sumMoney } from '@leather.io/utils';

import { useBtcTotalBalance } from './btc-balance.query';
import { useRunesTotalBalance } from './runes-balance.query';
import { useSip10TotalBalance } from './sip10-balance.query';

interface TotalBalance {
  btc: FetchState<BtcAggregateBalance>;
  stx: FetchState<StxAggregateBalance>;
  sip10: FetchState<Sip10AggregateBalance>;
  runes: FetchState<RunesAggregateBalance>;
  totalBalance: FetchState<Money>;
}

const zeroMoneyUsd = createMoney(0, 'USD');

export function useTotalBalance(): TotalBalance {
  const btcTotalBalance = useBtcTotalBalance();
  const stxTotalBalance = useStxTotalBalance();
  const sip10TotalBalance = useSip10TotalBalance();
  const runesTotalBalance = useRunesTotalBalance();

  const isLoading =
    btcTotalBalance.state === 'loading' &&
    stxTotalBalance.state === 'loading' &&
    sip10TotalBalance.state === 'loading' &&
    runesTotalBalance.state === 'loading';
  const isError =
    btcTotalBalance.state === 'error' &&
    stxTotalBalance.state === 'error' &&
    sip10TotalBalance.state === 'error' &&
    runesTotalBalance.state === 'error';
  const accountBalance = sumMoney(
    [
      zeroMoneyUsd,
      btcTotalBalance.value?.usd.availableBalance,
      stxTotalBalance.value?.usd.availableBalance,
      sip10TotalBalance.value?.usd.availableBalance,
      runesTotalBalance.value?.usd.availableBalance,
    ].filter(isDefined)
  );

  return {
    btc: btcTotalBalance,
    stx: stxTotalBalance,
    sip10: sip10TotalBalance,
    runes: runesTotalBalance,
    totalBalance: toFetchState({
      isLoading,
      data: accountBalance,
      isError,
      error: new Error('Error loading balance data'),
    }),
  };
}
