import { toFetchState } from '@/components/loading';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { useQuery } from '@tanstack/react-query';

import { QuoteCurrency } from '@leather.io/models';
import {
  createAccountBnsNamesQueryConfig,
  createAccountPrimaryBnsProfileQueryConfig,
  createBnsNameQueryConfig,
} from '@leather.io/queries';
import { AccountRequest, UserSettings } from '@leather.io/services';

export function useAccountPrimaryBnsProfile(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useGetAccountPrimaryBnsProfileQuery({ account }));
}

export function useAccountBnsNames(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useGetAccountBnsNamesQuery({ account }));
}

export function useGetBnsName(fullName?: string) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };

  return useQuery({
    enabled: !!fullName,
    ...createBnsNameQueryConfig(fullName!, settings),
  });
}

function useGetAccountPrimaryBnsProfileQuery(request: AccountRequest) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };

  return useQuery({
    ...createAccountPrimaryBnsProfileQueryConfig(request, settings),
  });
}

function useGetAccountBnsNamesQuery(request: AccountRequest) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };

  return useQuery({
    ...createAccountBnsNamesQueryConfig(request, settings),
  });
}
