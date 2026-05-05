import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { useQuery } from '@tanstack/react-query';

import { QuoteCurrency } from '@leather.io/models';
import {
  createBtcAggregateBalanceQueryConfig,
  createBtcBalanceQueryConfig,
} from '@leather.io/queries';
import { AccountRequest, UserSettings } from '@leather.io/services';

import { balanceQueryOptions } from './balance-query-options';

export function useBtcTotalBalance() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(
    useBtcAggregateBalanceQuery(
      accounts.map(account => ({
        account,
        protections: {
          isOrdinalsActive: true,
          discardedInscriptions: [],
        },
      }))
    )
  );
}
export function useBtcAccountBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(
    useBtcAccountBalanceQuery({
      account,
      protections: {
        isOrdinalsActive: true,
        discardedInscriptions: [],
      },
    })
  );
}

export function useBtcAccountNativeSegwitBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(
    useBtcAccountBalanceQuery({
      account,
      exclusions: { taprootAddresses: true },
      protections: {
        isOrdinalsActive: true,
        discardedInscriptions: [],
      },
    })
  );
}

export function useBtcAccountTaprootBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(
    useBtcAccountBalanceQuery({
      account,
      exclusions: { nativeSegwitAddresses: true },
      protections: {
        isOrdinalsActive: true,
        discardedInscriptions: [],
      },
    })
  );
}

function useBtcAccountBalanceQuery(request: AccountRequest) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };

  return useQuery({
    ...createBtcBalanceQueryConfig(request, settings),
    ...balanceQueryOptions,
  });
}

function useBtcAggregateBalanceQuery(requests: AccountRequest[]) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };

  return useQuery({
    ...createBtcAggregateBalanceQueryConfig(requests, settings),
    ...balanceQueryOptions,
  });
}
