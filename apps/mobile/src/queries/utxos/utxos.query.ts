import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { useQuery } from '@tanstack/react-query';

import { AccountAddresses, QuoteCurrency } from '@leather.io/models';
import { createAccountUtxosQueryConfig } from '@leather.io/queries';
import { AccountRequest, UserSettings } from '@leather.io/services';

export function useAccountUtxos(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useAccountUtxosQuery(account));
}

function useAccountUtxosQuery(account: AccountAddresses) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };

  const request: AccountRequest = { account };

  return useQuery({
    ...createAccountUtxosQueryConfig(request, settings),
  });
}
