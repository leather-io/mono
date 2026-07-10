import { useMemo } from 'react';

import { networkFromName } from '@stacks/network';
import { deserializeCV } from '@stacks/transactions';

import { RpcErrorCode, createRpcErrorResponse, createRpcSuccessResponse } from '@leather.io/rpc';

import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import {
  isSignableMessageType,
  isStructuredMessageType,
  isUtf8MessageType,
} from '@shared/signature/signature-types';
import { closeWindow } from '@shared/utils';
import { analytics } from '@shared/utils/analytics';

import { useDefaultRequestParams } from '@app/common/hooks/use-default-request-search-params';
import { initialSearchParams } from '@app/common/initial-search-params';
import {
  StructuredPayload,
  Utf8Payload,
} from '@app/features/stacks-message-signer/stacks-message-signing';
import { useSignStacksMessage } from '@app/features/stacks-message-signer/use-sign-stacks-message';

function getNetwork(networkName: string | null) {
  if (
    networkName === 'mainnet' ||
    networkName === 'testnet' ||
    networkName === 'devnet' ||
    networkName === 'mocknet'
  ) {
    return networkFromName(networkName);
  }
  return;
}

export function useRpcStacksMessagePayload() {
  const { messageType, message, network, appName, domain } = useRpcSignStacksMessageParams();

  if (isUtf8MessageType(messageType)) {
    return {
      messageType: 'utf8' as const,
      message,
      network: getNetwork(network),
      appName,
    } satisfies Utf8Payload;
  }

  if (isStructuredMessageType(messageType)) {
    if (!domain) return null;

    return {
      messageType: 'structured' as const,
      message: deserializeCV(message),
      domain: deserializeCV(domain),
      network: getNetwork(network),
      appName,
    } satisfies StructuredPayload;
  }
  return null;
}

export function useRpcSignStacksMessageParams() {
  const { frameId, origin, tabId } = useDefaultRequestParams();
  const requestId = initialSearchParams.get('requestId');
  const network = initialSearchParams.get('network');
  const appName = initialSearchParams.get('appName');
  const message = initialSearchParams.get('message');
  const messageType = initialSearchParams.get('messageType');
  const domain = initialSearchParams.get('domain');

  if (!requestId || !message || !origin || !isSignableMessageType(messageType))
    throw new Error('Missing required parameters for Stacks signing message request');

  return useMemo(
    () => ({
      origin,
      frameId,
      tabId: tabId ?? 0,
      requestId,
      network,
      message,
      messageType,
      appName,
      domain,
    }),
    [origin, frameId, requestId, network, message, messageType, tabId, appName, domain]
  );
}

export function useRpcSignStacksMessage() {
  const { frameId, tabId, requestId } = useRpcSignStacksMessageParams();
  if (!tabId) throw new Error('Requests can only be made with corresponding tab');

  const { isLoading, signMessage } = useSignStacksMessage({
    onSignMessageCompleted(messageSignature) {
      void sendMessageToOriginatingFrame(
        { frameId, tabId },
        createRpcSuccessResponse('stx_signMessage', {
          id: requestId,
          result: {
            signature: messageSignature.signature,
            publicKey: messageSignature.publicKey,
          },
        })
      );
      closeWindow();
    },
    onSignMessageCancelled: onCancelMessageSigning,
  });

  function onCancelMessageSigning() {
    if (!requestId || !tabId) return;
    analytics.track('request_signature_cancel');
    void sendMessageToOriginatingFrame(
      { frameId, tabId },
      createRpcErrorResponse('stx_signMessage', {
        id: requestId,
        error: {
          message: 'User denied signing',
          code: RpcErrorCode.USER_REJECTION,
        },
      })
    );
    closeWindow();
  }

  return { isLoading, signMessage, onCancelMessageSigning };
}
