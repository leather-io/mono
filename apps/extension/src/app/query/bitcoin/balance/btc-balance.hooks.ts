import type { AccountRequest } from '@leather.io/services';
import { createBtcBalance, createMoney } from '@leather.io/utils';

import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useNativeSegwitAccountRequest } from '@app/services/accounts/use-native-segwit-account-request';
import { useTaprootAccountRequest } from '@app/services/accounts/use-taproot-account-request';
import { useDiscardedInscriptions } from '@app/store/settings/settings.selectors';

import { useGetBtcAccountBalanceQuery } from './btc-balance.query';

const fallbackBtcBalance = createBtcBalance(createMoney(0, 'BTC'));
const fallbackQuoteBalance = createBtcBalance(createMoney(0, 'USD'));

export function useCurrentNativeSegwitBtcBalanceWithFallback() {
  const request = useNativeSegwitAccountRequest();
  return useBtcBalanceWithFallback(request);
}

export function useCurrentTaprootBtcBalanceWithFallback() {
  const request = useTaprootAccountRequest();
  return useBtcBalanceWithFallback(request);
}

function useBtcBalanceWithFallback(request: AccountRequest) {
  const balance = useGetBtcAccountBalanceQuery(request);
  return {
    isLoading: balance.isLoading,
    btc: balance.data?.btc ?? fallbackBtcBalance,
    quote: balance.data?.quote ?? fallbackQuoteBalance,
  };
}

export function useNativeSegwitBtcAccountBalance(accountIndex: number) {
  const account = useAccountAddresses(accountIndex);
  const discardedInscriptions = useDiscardedInscriptions();
  return useGetBtcAccountBalanceQuery({
    account,
    protections: {
      discardedInscriptions,
    },
    exclusions: { taprootAddresses: true },
  });
}
