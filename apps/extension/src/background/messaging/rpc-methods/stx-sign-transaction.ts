import {
  RpcErrorCode,
  createRpcErrorResponse,
  encodeBase64Json,
  stxSignTransaction,
} from '@leather.io/rpc';

import { RouteUrls } from '@shared/route-urls';
import { RpcErrorMessage } from '@shared/rpc/methods/validation.utils';

import { trackRpcRequestSuccess } from '../rpc-helpers';
import { defineRpcRequestHandler } from '../rpc-message-handler';
import {
  createConnectingAppSearchParamsWithLastKnownAccount,
  listenForPopupClose,
  makeNetworkRequestParam,
  triggerRequestPopupWindowOpen,
  validateRequestNetwork,
  validateRequestParams,
} from '../rpc-request-utils';

export const stxSignTransactionHandler = defineRpcRequestHandler(
  stxSignTransaction.method,
  async (request, port) => {
    const { id: requestId, method, params } = request;
    const { status } = validateRequestParams({
      id: requestId,
      method,
      params,
      port,
      schema: stxSignTransaction.params,
    });
    if (status === 'failure') return;
    const networkValidation = await validateRequestNetwork({
      id: requestId,
      method,
      network: params?.network,
      port,
    });
    if (networkValidation.status === 'failure') return;
    const { frameId, tabId, urlParams } = await createConnectingAppSearchParamsWithLastKnownAccount(
      port,
      [
        ['requestId', request.id],
        ['rpcRequest', encodeBase64Json(request)],
        makeNetworkRequestParam(request.params?.network),
      ]
    );

    const { id } = await triggerRequestPopupWindowOpen(RouteUrls.RpcStxSignTransaction, urlParams);
    void trackRpcRequestSuccess({ endpoint: request.method });

    listenForPopupClose({
      frameId,
      tabId,
      id,
      response: createRpcErrorResponse(method, {
        id: requestId,
        error: {
          code: RpcErrorCode.USER_REJECTION,
          message: RpcErrorMessage.UserRejectedOperation,
        },
      }),
    });
  }
);
