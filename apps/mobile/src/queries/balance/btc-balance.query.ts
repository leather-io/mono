import { toFetchState } from '@/components/loading/fetch-state';
import { useOrdinalsFlag } from '@/features/feature-flags';
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
  const ordinalsFlag = useOrdinalsFlag();
  return toFetchState(
    useBtcAggregateBalanceQuery(
      accounts.map(account => ({
        account,
        protections: {
          isRunesActive: false,
          isOrdinalsActive: ordinalsFlag,
          discardedInscriptions: [],
          discardRunes: true,
        },
      }))
    )
  );
}
export function useBtcAccountBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  const ordinalsFlag = useOrdinalsFlag();
  return toFetchState(
    useBtcAccountBalanceQuery({
      account,
      protections: {
        isRunesActive: false,
        isOrdinalsActive: ordinalsFlag,
        discardedInscriptions: [],
        discardRunes: true,
      },
    })
  );
}

export function useBtcAccountNativeSegwitBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  const ordinalsFlag = useOrdinalsFlag();
  return toFetchState(
    useBtcAccountBalanceQuery({
      account,
      exclusions: { taprootAddresses: true },
      protections: {
        isRunesActive: false,
        isOrdinalsActive: ordinalsFlag,
        discardedInscriptions: [],
        discardRunes: true,
      },
    })
  );
}

export function useBtcAccountTaprootBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  const ordinalsFlag = useOrdinalsFlag();
  return toFetchState(
    useBtcAccountBalanceQuery({
      account,
      exclusions: { nativeSegwitAddresses: true },
      protections: {
        isRunesActive: false,
        isOrdinalsActive: ordinalsFlag,
        discardedInscriptions: [],
        discardRunes: true,
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
