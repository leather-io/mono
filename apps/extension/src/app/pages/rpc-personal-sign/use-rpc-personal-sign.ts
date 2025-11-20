import { useMemo } from 'react';

import { createSiwsMessage } from 'sign-in-with-stacks';
import type { z } from 'zod';

import { RpcErrorCode, createRpcErrorResponse, createRpcSuccessResponse, stxPersonalSign } from '@leather.io/rpc';

import { closeWindow } from '@shared/utils';
import { analytics } from '@shared/utils/analytics';

import { useDefaultRequestParams } from '@app/common/hooks/use-default-request-search-params';
import { useSignStacksMessage } from '@app/features/stacks-message-signer/use-sign-stacks-message';

import { getDecodedRpcStxPersonalSignRequest } from './rpc-personal-sign.utils';

type SiwsMessageParams = z.infer<typeof stxPersonalSign.params>;

function generateSiwsMessage(params: SiwsMessageParams): string {
  const messageParams = {
    domain: params.domain,
    address: params.address,
    statement: params.statement,
    uri: params.uri,
    version: '1' as const,
    chainId: params.chainId,
    nonce: params.nonce,
    issuedAt: new Date(params.issuedAt),
    expirationTime: params.expirationTime ? new Date(params.expirationTime) : undefined,
    notBefore: params.notBefore ? new Date(params.notBefore) : undefined,
    requestId: params.requestId,
    resources: params.resources,
  };

  return createSiwsMessage(messageParams);
}

export function useRpcPersonalSignParams() {
  const { origin, tabId } = useDefaultRequestParams();
  const decodedRequest = getDecodedRpcStxPersonalSignRequest();
  const siwsParams = decodedRequest.params;
  const requestId = decodedRequest.id;

  const message = generateSiwsMessage(siwsParams);

  return useMemo(
    () => ({
      origin,
      tabId: tabId ?? 0,
      requestId,
      siwsParams,
      message,
    }),
    [origin, requestId, tabId, siwsParams, message]
  );
}

export function useRpcPersonalSign() {
  const { tabId, requestId, message } = useRpcPersonalSignParams();

  if (!tabId) throw new Error('Requests can only be made with corresponding tab');

  const { isLoading, signMessage } = useSignStacksMessage({
    onSignMessageCompleted(messageSignature) {
      chrome.tabs.sendMessage(
        tabId,
        createRpcSuccessResponse('stx_personalSign', {
          id: requestId,
          result: {
            signature: messageSignature.signature,
            publicKey: messageSignature.publicKey,
            message,
          },
        })
      );
      closeWindow();
    },
    onSignMessageCancelled: onCancelPersonalSign,
  });

  function onCancelPersonalSign() {
    if (!requestId || !tabId) return;
    void analytics.track('request_signature_cancel');
    chrome.tabs.sendMessage(
      tabId,
      createRpcErrorResponse('stx_personalSign', {
        id: requestId,
        error: {
          message: 'User denied signing',
          code: RpcErrorCode.USER_REJECTION,
        },
      })
    );
    closeWindow();
  }

  return { isLoading, signMessage, onCancelPersonalSign };
}
