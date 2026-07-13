import { useMemo } from 'react';

import { ensureArray, isDefined, undefinedIfLengthZero } from '@leather.io/utils';

import { useDefaultRequestParams } from '../hooks/use-default-request-search-params';
import { initialSearchParams } from '../initial-search-params';
import { getPsbtPayloadFromToken } from './requests';

export function usePsbtRequestSearchParams() {
  const { frameId, origin, tabId } = useDefaultRequestParams();
  const requestToken = initialSearchParams.get('request');

  if (!requestToken) throw new Error('Cannot decode psbt without request token');

  const payload = getPsbtPayloadFromToken(requestToken);

  return useMemo(
    () => ({
      appName: payload?.appDetails?.name,
      frameId,
      origin,
      payload,
      requestToken,
      signAtIndex: isDefined(payload?.signAtIndex)
        ? undefinedIfLengthZero(ensureArray(payload?.signAtIndex).map(h => Number(h)))
        : undefined,
      tabId: tabId ?? 1,
    }),
    [frameId, origin, payload, requestToken, tabId]
  );
}

export function useRpcSignPsbtParams() {
  const { frameId, origin, tabId } = useDefaultRequestParams();
  const broadcast = initialSearchParams.get('broadcast');
  const descriptor = initialSearchParams.get('descriptor');
  const psbtHex = initialSearchParams.get('hex');
  const requestId = initialSearchParams.get('requestId');
  const signAtIndex = initialSearchParams.getAll('signAtIndex');

  return useMemo(
    () => ({
      broadcast: broadcast === 'true',
      descriptor: descriptor ?? undefined,
      frameId,
      origin,
      psbtHex,
      requestId,
      signAtIndex: undefinedIfLengthZero(ensureArray(signAtIndex).map(h => Number(h))),
      tabId: tabId ?? 0,
    }),
    [broadcast, descriptor, frameId, origin, psbtHex, requestId, signAtIndex, tabId]
  );
}
