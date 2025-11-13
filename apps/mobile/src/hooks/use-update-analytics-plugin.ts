import { useEffect } from 'react';

import { useSettings } from '@/store/settings/settings';
import { setAnalyticsNetwork } from '@/utils/analytics';

export function useUpdateAnalyticsPlugin() {
  const { networkPreference } = useSettings();
  const networkMode = networkPreference.chain.bitcoin.mode;

  useEffect(() => {
    setAnalyticsNetwork(networkMode);
  }, [networkMode]);
}
