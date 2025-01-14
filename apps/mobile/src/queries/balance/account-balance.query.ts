import { AccountId } from '@/models/domain.model';
import { useStxAccountBalance } from '@/queries/balance/stx-balance.query';
import { FetchState, toFetchState } from '@/shared/fetch-state';

import { Money } from '@leather.io/models';
import { BtcAccountBalance, Sip10AddressBalance, StxAddressBalance } from '@leather.io/services';
import { createMoney, isDefined, sumMoney } from '@leather.io/utils';

import { useBtcAccountBalance } from './btc-balance.query';
import { useSip10AccountBalance } from './sip10-balance.query';

interface AccountBalance {
  btc: FetchState<BtcAccountBalance>;
  stx: FetchState<StxAddressBalance>;
  sip10: FetchState<Sip10AddressBalance>;
  totalBalance: FetchState<Money>;
}

const zeroMoneyUsd = createMoney(0, 'USD');

export function useAccountBalance(accountId: AccountId): AccountBalance {
  const { fingerprint, accountIndex } = accountId;

  const btcAccountBalance = useBtcAccountBalance(fingerprint, accountIndex);
  const stxAccountBalance = useStxAccountBalance(fingerprint, accountIndex);
  const sip10AccountBalance = useSip10AccountBalance(fingerprint, accountIndex);

  const isLoading =
    btcAccountBalance.state === 'loading' &&
    stxAccountBalance.state === 'loading' &&
    sip10AccountBalance.state === 'loading';
  const isError =
    btcAccountBalance.state === 'error' &&
    stxAccountBalance.state === 'error' &&
    sip10AccountBalance.state === 'error';
  const accountBalance = sumMoney(
    [
      zeroMoneyUsd,
      btcAccountBalance.value?.usd.availableBalance,
      stxAccountBalance.value?.usd.availableBalance,
      sip10AccountBalance.value?.usd.availableBalance,
    ].filter(isDefined)
  );

  return {
    btc: btcAccountBalance,
    stx: stxAccountBalance,
    sip10: sip10AccountBalance,
    totalBalance: toFetchState({
      isLoading,
      data: accountBalance,
      isError,
      error: new Error('Error loading balance data'),
    }),
  };
}
