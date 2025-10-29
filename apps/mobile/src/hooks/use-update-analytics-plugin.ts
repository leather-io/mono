import { useEffect } from 'react';

import { useSettings } from '@/store/settings/settings';
import { contextMiddlewarePluginInstance } from '@/utils/analytics-plugins';

export function useUpdateAnalyticsPlugin() {
  const { networkPreference } = useSettings();
  const networkMode = networkPreference.chain.bitcoin.mode;

  useEffect(() => {
    contextMiddlewarePluginInstance.setNetwork(networkMode);
  }, [networkMode]);
}
