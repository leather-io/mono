import { FetchState, toFetchState } from '@/components/loading/fetch-state';
import { useStxTotalBalance } from '@/queries/balance/stx-balance.query';
import { useSettings } from '@/store/settings/settings';

import { Money } from '@leather.io/models';
import {
  QuotedBtcBalance,
  QuotedStxBalance,
  RunesAggregateBalance,
  Sip10AggregateBalance,
} from '@leather.io/services';
import { createMoney, isDefined, sumMoney } from '@leather.io/utils';

import { useBtcTotalBalance } from './btc-balance.query';
import { useRunesTotalBalance } from './runes-balance.query';
import { useSip10TotalBalance } from './sip10-balance.query';

interface TotalBalance {
  btc: FetchState<QuotedBtcBalance>;
  stx: FetchState<QuotedStxBalance>;
  sip10: FetchState<Sip10AggregateBalance>;
  runes: FetchState<RunesAggregateBalance>;
  totalBalance: FetchState<Money>;
}

export function useTotalBalance(): TotalBalance {
  const { fiatCurrencyPreference } = useSettings();
  const zeroMoneyQuote = createMoney(0, fiatCurrencyPreference);

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
      zeroMoneyQuote,
      btcTotalBalance.value?.quote.availableBalance,
      stxTotalBalance.value?.quote.availableBalance,
      sip10TotalBalance.value?.quote.availableBalance,
      runesTotalBalance.value?.quote.availableBalance,
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
