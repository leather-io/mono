import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { useQuery } from '@tanstack/react-query';

import { AccountId, QuoteCurrency } from '@leather.io/models';
import {
  createAccountTotalBalanceQueryConfig,
  createAccountUnlockedBalanceQueryConfig,
} from '@leather.io/queries';
import { AccountRequest, UserSettings } from '@leather.io/services';

import { balanceQueryOptions } from './balance-query-options';

export function useAccountTotalBalance(
  accountId: AccountId,
  overrideFiatCurrencyPreference?: QuoteCurrency
) {
  const account = useAccountAddresses(accountId.fingerprint, accountId.accountIndex);
  return toFetchState(
    useGetAccountTotalBalanceQuery(
      {
        account,
        protections: {
          isRunesActive: false,
          isOrdinalsActive: true,
          discardedInscriptions: [],
          discardRunes: true,
        },
      },
      overrideFiatCurrencyPreference
    )
  );
}

export function useAccountUnlockedBalance(
  accountId: AccountId,
  overrideFiatCurrencyPreference?: QuoteCurrency
) {
  const account = useAccountAddresses(accountId.fingerprint, accountId.accountIndex);
  return toFetchState(
    useGetAccountUnlockedBalanceQuery(
      {
        account,
        protections: {
          isRunesActive: false,
          isOrdinalsActive: true,
          discardedInscriptions: [],
          discardRunes: true,
        },
      },
      overrideFiatCurrencyPreference
    )
  );
}

function useGetAccountTotalBalanceQuery(
  request: AccountRequest,
  overrideFiatCurrencyPreference?: QuoteCurrency
) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const currencyPreference = overrideFiatCurrencyPreference ?? fiatCurrencyPreference;
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: currencyPreference,
    assetVisibility,
  };

  return useQuery({
    ...createAccountTotalBalanceQueryConfig(request, settings),
    ...balanceQueryOptions,
  });
}

function useGetAccountUnlockedBalanceQuery(
  request: AccountRequest,
  overrideFiatCurrencyPreference?: QuoteCurrency
) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const currencyPreference = overrideFiatCurrencyPreference ?? fiatCurrencyPreference;
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: currencyPreference,
    assetVisibility,
  };

  return useQuery({
    ...createAccountUnlockedBalanceQueryConfig(request, settings),
    ...balanceQueryOptions,
  });
}
