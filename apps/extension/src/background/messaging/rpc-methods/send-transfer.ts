import {
  RpcErrorCode,
  type RpcSendTransferLegacyParams,
  type RpcSendTransferParams,
  createRpcErrorResponse,
  sendTransfer,
} from '@leather.io/rpc';
import { isUndefined } from '@leather.io/utils';

import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { RouteUrls } from '@shared/route-urls';
import {
  convertRpcSendTransferLegacyParamsToNew,
  defaultRpcSendTransferNetwork,
  getRpcSendTransferParamErrors,
  validateRpcSendTransferLegacyParams,
  validateRpcSendTransferParams,
} from '@shared/rpc/methods/send-transfer';

import { defineRpcRequestHandler } from '../define-rpc-request-handler';
import { trackRpcRequestError, trackRpcRequestSuccess } from '../rpc-helpers';
import {
  type RequestParams,
  createConnectingAppSearchParamsWithLastKnownAccount,
  getOriginatingFrameFromPort,
  sendErrorResponseOnUserPopupClose,
  triggerRequestPopupWindowOpen,
} from '../rpc-request-utils';

function isRpcSendTransferLegacyParams(params: unknown): params is RpcSendTransferLegacyParams {
  return validateRpcSendTransferLegacyParams(params);
}

function isRpcSendTransferParams(params: unknown): params is RpcSendTransferParams {
  return validateRpcSendTransferParams(params);
}

export const sendTransferHandler = defineRpcRequestHandler(
  sendTransfer.method,
  async (request, port) => {
    if (isUndefined(request.params)) {
      void trackRpcRequestError({ endpoint: 'sendTransfer', error: 'Undefined parameters' });

      void sendMessageToOriginatingFrame(
        getOriginatingFrameFromPort(port),
        createRpcErrorResponse('sendTransfer', {
          id: request.id,
          error: { code: RpcErrorCode.INVALID_REQUEST, message: 'Parameters undefined' },
        })
      );
      return;
    }

    // Legacy params support for backward compatibility
    const params: unknown = isRpcSendTransferLegacyParams(request.params)
      ? convertRpcSendTransferLegacyParamsToNew(request.params)
      : request.params;

    if (!isRpcSendTransferParams(params)) {
      void trackRpcRequestError({ endpoint: 'sendTransfer', error: 'Invalid parameters' });

      void sendMessageToOriginatingFrame(
        getOriginatingFrameFromPort(port),
        createRpcErrorResponse('sendTransfer', {
          id: request.id,
          error: {
            code: RpcErrorCode.INVALID_PARAMS,
            message: getRpcSendTransferParamErrors(params),
          },
        })
      );
      return;
    }

    void trackRpcRequestSuccess({ endpoint: request.method });

    const recipients: [string, string][] = params.recipients.map(({ address }) => [
      'recipient',
      address,
    ]);
    const amounts: [string, string][] = params.recipients.map(({ amount }) => ['amount', amount]);

    const requestParams: RequestParams = [
      ...recipients,
      ...amounts,
      ['network', params.network ?? defaultRpcSendTransferNetwork],
      ['requestId', request.id],
    ];

    if (params.account) {
      requestParams.push(['accountIndex', params.account.toString()]);
    }

    requestParams.push(['broadcast', String(params.broadcast ?? true)]);

    const { frameId, urlParams, tabId } = await createConnectingAppSearchParamsWithLastKnownAccount(
      port,
      requestParams
    );

    const { id } = await triggerRequestPopupWindowOpen(RouteUrls.RpcSendTransfer, urlParams);

    sendErrorResponseOnUserPopupClose({ frameId, tabId, id, request });
  }
);
