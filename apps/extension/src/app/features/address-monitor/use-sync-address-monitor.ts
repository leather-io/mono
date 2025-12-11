import { useEffect, useRef } from 'react';

import isEqual from 'lodash.isequal';

import { useMonitorableAddresses } from '@app/features/address-monitor/use-monitorable-addresses';
import { useIsNotificationsEnabled } from '@app/store/settings/settings.selectors';
import {
  ADDRESS_MONITOR_STORE,
  type MonitoredAddress,
} from '@background/monitors/address-monitor';

export function useSyncAddressMonitor() {
  const isNotificationsEnabled = useIsNotificationsEnabled();
  const addresses = useMonitorableAddresses();
  const prevAddresses = useRef<MonitoredAddress[]>([]);

  useEffect(() => {
    const monitorableAddresses = isNotificationsEnabled ? addresses : [];
    if (monitorableAddresses && !isEqual(monitorableAddresses, prevAddresses.current)) {
      prevAddresses.current = monitorableAddresses;
      void chrome.storage.local.set({
        [ADDRESS_MONITOR_STORE]: monitorableAddresses,
      });
    }
  }, [addresses, isNotificationsEnabled]);
}
