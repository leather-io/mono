import { useMemo } from 'react';

import { ensureArray, undefinedIfLengthZero } from '@leather.io/utils';

import { useDefaultRequestParams } from '../hooks/use-default-request-search-params';
import { initialSearchParams } from '../initial-search-params';

export function useRpcSignPsbtParams() {
  const { frameId, origin, tabId } = useDefaultRequestParams();
  const broadcast = initialSearchParams.get('broadcast');
  const descriptor = initialSearchParams.get('descriptor');
  const propose = initialSearchParams.get('propose');
  const psbtHex = initialSearchParams.get('hex');
  const requestId = initialSearchParams.get('requestId');
  const signAtIndex = initialSearchParams.getAll('signAtIndex');

  return useMemo(
    () => ({
      broadcast: broadcast === 'true',
      descriptor: descriptor ?? undefined,
      frameId,
      origin,
      propose: propose === 'true',
      psbtHex,
      requestId,
      signAtIndex: undefinedIfLengthZero(ensureArray(signAtIndex).map(h => Number(h))),
      tabId: tabId ?? 0,
    }),
    [broadcast, descriptor, frameId, origin, propose, psbtHex, requestId, signAtIndex, tabId]
  );
}
