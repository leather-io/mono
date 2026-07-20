import {
  RpcErrorCode,
  type RpcSendTransferLegacyParams,
  type RpcSendTransferParams,
  createRpcErrorResponse,
  sendTransfer,
} from '@leather.io/rpc';
import { isDefined, isUndefined } from '@leather.io/utils';

import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { RouteUrls } from '@shared/route-urls';
import {
  convertRpcSendTransferLegacyParamsToNew,
  getRpcSendTransferParamErrors,
  validateRpcSendTransferLegacyParams,
  validateRpcSendTransferParams,
} from '@shared/rpc/methods/send-transfer';

import { trackRpcRequestError, trackRpcRequestSuccess } from '../rpc-helpers';
import { defineRpcRequestHandler } from '../rpc-message-handler';
import {
  RequestParams,
  createConnectingAppSearchParamsWithLastKnownAccount,
  getOriginatingFrameFromPort,
  sendErrorResponseOnUserPopupClose,
  triggerRequestPopupWindowOpen,
  validateRequestNetwork,
} from '../rpc-request-utils';

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
    const params = validateRpcSendTransferLegacyParams(request.params)
      ? convertRpcSendTransferLegacyParamsToNew(request.params as RpcSendTransferLegacyParams)
      : (request.params as RpcSendTransferParams);

    if (!validateRpcSendTransferParams(params)) {
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

    const networkValidation = await validateRequestNetwork({
      id: request.id,
      method: request.method,
      network: params.network,
      port,
    });
    if (networkValidation.status === 'failure') return;

    void trackRpcRequestSuccess({ endpoint: request.method });

    const recipients: [string, string][] = params.recipients.map(({ address }) => [
      'recipient',
      address,
    ]);
    const amounts: [string, string][] = params.recipients.map(({ amount }) => ['amount', amount]);

    const requestParams: RequestParams = [...recipients, ...amounts, ['requestId', request.id]];

    if (isDefined(params.account)) {
      requestParams.push(['accountIndex', params.account.toString()]);
    }

    const { frameId, urlParams, tabId } = await createConnectingAppSearchParamsWithLastKnownAccount(
      port,
      requestParams,
      { network: params.network }
    );

    const { id } = await triggerRequestPopupWindowOpen(RouteUrls.RpcSendTransfer, urlParams);

    sendErrorResponseOnUserPopupClose({ frameId, tabId, id, request });
  }
);
