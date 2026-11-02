import { useMemo } from 'react';

import { useSettings } from '@/store/settings/settings';

import type { UserSettings } from '@leather.io/services';

export function useUserSettings(): UserSettings {
  const { fiatCurrencyPreference, networkPreference, assetVisibility, defaultAssetVisibility } =
    useSettings();
  return useMemo(
    () => ({
      quoteCurrency: fiatCurrencyPreference,
      network: networkPreference,
      assetVisibility,
      defaultAssetVisibility,
    }),
    [fiatCurrencyPreference, networkPreference, assetVisibility, defaultAssetVisibility]
  );
}
