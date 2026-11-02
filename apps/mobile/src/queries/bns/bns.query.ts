import { toFetchState } from '@/components/loading';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { useQuery } from '@tanstack/react-query';

import { createAccountBnsNamesQueryConfig, createBnsNameQueryConfig } from '@leather.io/queries';
import { type AccountRequest, type UserSettings } from '@leather.io/services';

export function useAccountBnsNames(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useGetAccountBnsNamesQuery({ account }));
}

export function useGetBnsName(fullName?: string) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference,
    assetVisibility,
  };

  return useQuery({
    enabled: !!fullName,
    ...createBnsNameQueryConfig(fullName!, settings),
  });
}

function useGetAccountBnsNamesQuery(request: AccountRequest) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference,
    assetVisibility,
  };

  return useQuery({
    ...createAccountBnsNamesQueryConfig(request, settings),
  });
}
