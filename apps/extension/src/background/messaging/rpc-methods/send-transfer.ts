import { RpcErrorCode, createRpcErrorResponse, sendTransfer } from '@leather.io/rpc';
import { isUndefined } from '@leather.io/utils';

import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { RouteUrls } from '@shared/route-urls';
import {
  convertRpcSendTransferLegacyParamsToNew,
  defaultRpcSendTransferNetwork,
  getRpcSendTransferParamErrors,
  rpcSendTransferParamsSchema,
  rpcSendTransferParamsSchemaLegacy,
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
    const legacyParams = rpcSendTransferParamsSchemaLegacy.safeParse(request.params);
    const params: unknown = legacyParams.success
      ? convertRpcSendTransferLegacyParamsToNew(legacyParams.data)
      : request.params;

    const parsedParams = rpcSendTransferParamsSchema.safeParse(params);
    if (!parsedParams.success) {
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

    const validParams = parsedParams.data;

    const recipients: [string, string][] = validParams.recipients.map(({ address }) => [
      'recipient',
      address,
    ]);
    const amounts: [string, string][] = validParams.recipients.map(({ amount }) => [
      'amount',
      amount,
    ]);

    const requestParams: RequestParams = [
      ...recipients,
      ...amounts,
      ['network', validParams.network ?? defaultRpcSendTransferNetwork],
      ['requestId', request.id],
    ];

    if (validParams.account) {
      requestParams.push(['accountIndex', validParams.account.toString()]);
    }

    requestParams.push(['broadcast', String(validParams.broadcast ?? true)]);

    const { frameId, urlParams, tabId } = await createConnectingAppSearchParamsWithLastKnownAccount(
      port,
      requestParams
    );

    const { id } = await triggerRequestPopupWindowOpen(RouteUrls.RpcSendTransfer, urlParams);

    sendErrorResponseOnUserPopupClose({ frameId, tabId, id, request });
  }
);
