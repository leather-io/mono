import { QuoteCurrency } from '@leather.io/models';
import type { UserSettings } from '@leather.io/services';

import { useSettings } from './settings';

export function useUserSettings(): UserSettings {
  const { networkPreference, fiatCurrencyPreference, assetVisibility } = useSettings();
  return {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };
}
