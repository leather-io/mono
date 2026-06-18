import { useMemo } from 'react';

import type { AccountId } from '@leather.io/models';

import { SignedMessageType } from '@shared/signature/signature-types';

import { useDefaultRequestParams } from '@app/common/hooks/use-default-request-search-params';
import { initialSearchParams } from '@app/common/initial-search-params';
import { getGenericSignaturePayloadFromToken } from '@app/common/signature/requests';
import { useStacksAccounts } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

export function useSignatureRequestSearchParams() {
  const { origin, tabId } = useDefaultRequestParams();

  return useMemo(() => {
    const requestToken = initialSearchParams.get('request');
    const messageType = initialSearchParams.get('messageType') as SignedMessageType;

    return {
      tabId,
      requestToken,
      origin,
      messageType,
    };
  }, [origin, tabId]);
}

function useSignatureRequestState() {
  const { requestToken } = useSignatureRequestSearchParams();
  return useMemo(() => {
    if (!requestToken) return null;
    return getGenericSignaturePayloadFromToken(requestToken);
  }, [requestToken]);
}

export function useSignatureRequestAccountId(): AccountId | undefined {
  const signaturePayload = useSignatureRequestState();
  const accounts = useStacksAccounts();

  if (!signaturePayload?.stxAddress) return undefined;
  const account = accounts?.find(account => account.address === signaturePayload.stxAddress);
  if (account) return { fingerprint: account.fingerprint, accountIndex: account.accountIndex };
  return undefined;
}
