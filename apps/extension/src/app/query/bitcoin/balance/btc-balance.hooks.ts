import type { AccountId } from '@leather.io/models';
import type { AccountRequest } from '@leather.io/services';
import { createBtcBalance, createMoney } from '@leather.io/utils';

import { useFlags } from '@app/features/feature-flags';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useAccountRequest } from '@app/services/accounts/use-account-request';
import { toFetchState } from '@app/services/fetch-state';
import { useDiscardedInscriptions } from '@app/store/settings/settings.selectors';

import { useGetBtcAccountBalanceQuery } from './btc-balance.query';

const fallbackBtcBalance = createBtcBalance(createMoney(0, 'BTC'));
const fallbackQuoteBalance = createBtcBalance(createMoney(0, 'USD'));

function useBtcBalanceWithFallback(request: AccountRequest) {
  const balance = toFetchState(useGetBtcAccountBalanceQuery(request));
  return {
    isLoading: balance.state !== 'success',
    btc: balance.value?.btc ?? fallbackBtcBalance,
    quote: balance.value?.quote ?? fallbackQuoteBalance,
  };
}

export function useCurrentBtcBalanceWithFallback() {
  const request = useAccountRequest();
  return useBtcBalanceWithFallback(request);
}

export function useBtcAccountBalance(accountId: AccountId) {
  const account = useAccountAddresses(accountId);
  const discardedInscriptions = useDiscardedInscriptions();
  const { isOrdinalsActive } = useFlags();
  return toFetchState(
    useGetBtcAccountBalanceQuery({
      account,
      protections: {
        discardedInscriptions,
        isOrdinalsActive,
      },
    })
  );
}

export function useNativeSegwitBtcAccountBalance(accountId: AccountId) {
  const account = useAccountAddresses(accountId);
  const discardedInscriptions = useDiscardedInscriptions();
  const { isOrdinalsActive } = useFlags();

  return toFetchState(
    useGetBtcAccountBalanceQuery({
      account,
      protections: {
        discardedInscriptions,
        isOrdinalsActive,
      },
      exclusions: { taprootAddresses: true },
    })
  );
}

export function useTaprootBtcAccountBalance(accountId: AccountId) {
  const account = useAccountAddresses(accountId);
  const discardedInscriptions = useDiscardedInscriptions();
  const { isOrdinalsActive } = useFlags();

  return toFetchState(
    useGetBtcAccountBalanceQuery({
      account,
      protections: {
        discardedInscriptions,
        isOrdinalsActive,
      },
      exclusions: { nativeSegwitAddresses: true },
    })
  );
}
