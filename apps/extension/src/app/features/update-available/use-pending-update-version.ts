import { useEffect, useState } from 'react';

import { isString } from '@leather.io/utils';

import { extensionUpdateStorageKeys, getPendingUpdateVersion } from '@shared/extension-update';
import { logger } from '@shared/logger';

export function usePendingUpdateVersion() {
  const [pendingVersion, setPendingVersion] = useState<string | null>(null);

  useEffect(() => {
    let hasObservedChange = false;

    function onStorageChanged(
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: chrome.storage.AreaName
    ) {
      if (areaName !== 'session' || !(extensionUpdateStorageKeys.pendingVersion in changes)) return;
      hasObservedChange = true;
      const newValue: unknown = changes[extensionUpdateStorageKeys.pendingVersion]?.newValue;
      setPendingVersion(isString(newValue) ? newValue : null);
    }

    chrome.storage.onChanged.addListener(onStorageChanged);

    getPendingUpdateVersion()
      .then(version => {
        if (hasObservedChange) return;
        setPendingVersion(version);
      })
      .catch(e => logger.error('Unable to read the pending extension update version: ', e));

    return () => chrome.storage.onChanged.removeListener(onStorageChanged);
  }, []);

  return pendingVersion;
}
