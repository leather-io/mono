import { useMemo } from 'react';

import { isString } from '@leather.io/utils';

import { initialSearchParams } from '@app/common/initial-search-params';

export function useDefaultRequestParams() {
  return useMemo(() => {
    const origin = initialSearchParams.get('origin');
    const topOrigin = initialSearchParams.get('topOrigin');
    const tabId = initialSearchParams.get('tabId');
    const frameId = initialSearchParams.get('frameId');

    return {
      origin,
      topOrigin: topOrigin ? topOrigin : null,
      frameId: isString(frameId) ? parseInt(frameId, 10) : (frameId ?? 0),
      tabId: isString(tabId) ? parseInt(tabId, 10) : (tabId ?? 0),
    };
  }, []);
}
