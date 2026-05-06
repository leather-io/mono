import { toFetchState } from '@/components/loading/fetch-state';
import { useOrdinalsFlag } from '@/features/feature-flags';
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
  const ordinalsFlag = useOrdinalsFlag();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };

  const request: AccountRequest = {
    account,
    protections: {
      isRunesActive: false,
      isOrdinalsActive: ordinalsFlag,
      discardedInscriptions: [],
      discardRunes: true,
    },
  };

  return useQuery({
    ...createAccountUtxosQueryConfig(request, settings),
  });
}
