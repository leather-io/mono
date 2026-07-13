import { useCallback } from 'react';

import { finalizeAuthResponse } from '@shared/actions/finalize-auth-response';

import { useOnboardingState } from '../hooks/auth/use-onboarding-state';
import { useDefaultRequestParams } from '../hooks/use-default-request-search-params';

export function useCancelAuthRequest() {
  const { decodedAuthRequest, authRequest } = useOnboardingState();
  const { frameId, origin, tabId } = useDefaultRequestParams();

  return useCallback(() => {
    if (!decodedAuthRequest || !authRequest || !origin || !tabId) {
      return;
    }
    const authResponse = 'cancel';
    finalizeAuthResponse({
      decodedAuthRequest,
      frameId,
      authRequest,
      authResponse,
      requestingOrigin: origin,
      tabId,
    });
  }, [decodedAuthRequest, authRequest, frameId, origin, tabId]);
}
