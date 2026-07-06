import {
  RpcErrorCode,
  type RpcSendTransferLegacyParams,
  type RpcSendTransferParams,
  createRpcErrorResponse,
  sendTransfer,
} from '@leather.io/rpc';
import { isUndefined } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';
import {
  convertRpcSendTransferLegacyParamsToNew,
  defaultRpcSendTransferNetwork,
  getRpcSendTransferParamErrors,
  validateRpcSendTransferLegacyParams,
  validateRpcSendTransferParams,
} from '@shared/rpc/methods/send-transfer';

import { trackRpcRequestError, trackRpcRequestSuccess } from '../rpc-helpers';
import { defineRpcRequestHandler } from '../rpc-message-handler';
import {
  RequestParams,
  createConnectingAppSearchParamsWithLastKnownAccount,
  getTabIdFromPort,
  sendErrorResponseOnUserPopupClose,
  triggerRequestPopupWindowOpen,
  validateActivePolicyChain,
} from '../rpc-request-utils';

export const sendTransferHandler = defineRpcRequestHandler(
  sendTransfer.method,
  async (request, port) => {
    // A Bitcoin policy proposes the transfer (handled in the approval page); any
    // other active policy is rejected so it can't fall through to single-sig.
    if ((await validateActivePolicyChain(request, port, 'bitcoin')).status === 'failure') return;

    if (isUndefined(request.params)) {
      void trackRpcRequestError({ endpoint: 'sendTransfer', error: 'Undefined parameters' });

      void chrome.tabs.sendMessage(
        getTabIdFromPort(port),
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

      void chrome.tabs.sendMessage(
        getTabIdFromPort(port),
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

    const { urlParams, tabId } = await createConnectingAppSearchParamsWithLastKnownAccount(
      port,
      requestParams
    );

    const { id } = await triggerRequestPopupWindowOpen(RouteUrls.RpcSendTransfer, urlParams);

    sendErrorResponseOnUserPopupClose({ tabId, id, request });
  }
);
