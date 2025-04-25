import { FetchState, toFetchState } from '@/components/loading/fetch-state';
import { useStxAccountBalance } from '@/queries/balance/stx-balance.query';
import { useSettings } from '@/store/settings/settings';

import { AccountId, Money } from '@leather.io/models';
import {
  BtcAccountBalance,
  RunesAccountBalance,
  Sip10AddressBalance,
  StxAddressBalance,
} from '@leather.io/services';
import { createMoney, isDefined, sumMoney } from '@leather.io/utils';

import { useBtcAccountBalance } from './btc-balance.query';
import { useRunesAccountBalance } from './runes-balance.query';
import { useSip10AccountBalance } from './sip10-balance.query';

export interface AccountBalance {
  btc: FetchState<BtcAccountBalance>;
  stx: FetchState<StxAddressBalance>;
  sip10: FetchState<Sip10AddressBalance>;
  runes: FetchState<RunesAccountBalance>;
  totalBalance: FetchState<Money>;
}

export function useAccountBalance(accountId: AccountId): AccountBalance {
  const { fingerprint, accountIndex } = accountId;
  const { fiatCurrencyPreference } = useSettings();
  const zeroMoneyFiat = createMoney(0, fiatCurrencyPreference);

  const btcAccountBalance = useBtcAccountBalance(fingerprint, accountIndex);
  const stxAccountBalance = useStxAccountBalance(fingerprint, accountIndex);
  const sip10AccountBalance = useSip10AccountBalance(fingerprint, accountIndex);
  const runesAccountBalance = useRunesAccountBalance(fingerprint, accountIndex);

  const isLoading =
    btcAccountBalance.state === 'loading' &&
    stxAccountBalance.state === 'loading' &&
    sip10AccountBalance.state === 'loading' &&
    runesAccountBalance.state === 'loading';
  const isError =
    btcAccountBalance.state === 'error' &&
    stxAccountBalance.state === 'error' &&
    sip10AccountBalance.state === 'error' &&
    runesAccountBalance.state === 'error';
  const accountBalance = sumMoney(
    [
      zeroMoneyFiat,
      btcAccountBalance.value?.fiat.availableBalance,
      stxAccountBalance.value?.fiat.availableBalance,
      sip10AccountBalance.value?.fiat.availableBalance,
      runesAccountBalance.value?.fiat.availableBalance,
    ].filter(isDefined)
  );

  return {
    btc: btcAccountBalance,
    stx: stxAccountBalance,
    sip10: sip10AccountBalance,
    runes: runesAccountBalance,
    totalBalance: toFetchState({
      isLoading,
      data: accountBalance,
      isError,
      error: new Error('Error loading balance data'),
    }),
  };
}
