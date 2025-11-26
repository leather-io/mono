import { useMemo } from 'react';

import { useQuoteCurrency } from '~/store/quote-currency';
import { useStacksNetwork } from '~/store/stacks-network';

import type { UserSettings } from '@leather.io/services';

export function useUserSettings(): UserSettings {
  const { quoteCurrency } = useQuoteCurrency();
  const { networkPreference } = useStacksNetwork();

  return useMemo(
    () => ({
      quoteCurrency,
      network: networkPreference,
      assetVisibility: {},
    }),
    [quoteCurrency, networkPreference]
  );
}
