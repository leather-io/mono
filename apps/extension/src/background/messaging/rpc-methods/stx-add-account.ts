import { encodeBase64Json, stxAddAccount } from '@leather.io/rpc';

import { RouteUrls } from '@shared/route-urls';

import { trackRpcRequestSuccess } from '../rpc-helpers';
import { defineRpcRequestHandler } from '../rpc-message-handler';
import {
  createConnectingAppSearchParamsWithLastKnownAccount,
  makeNetworkRequestParam,
  sendErrorResponseOnUserPopupClose,
  triggerRequestPopupWindowOpen,
  validateRequestNetwork,
  validateRequestParams,
} from '../rpc-request-utils';

export const stxAddAccountHandler = defineRpcRequestHandler(
  stxAddAccount.method,
  async (request, port) => {
    // The Zod schema enforces the multisig data: 2+ valid compressed public keys
    // and 1 <= threshold <= number of keys.
    const { status } = validateRequestParams({
      id: request.id,
      method: request.method,
      params: request.params,
      port,
      schema: stxAddAccount.params,
    });
    if (status === 'failure') return;

    const networkValidation = await validateRequestNetwork({
      id: request.id,
      method: request.method,
      network: request.params.network,
      port,
    });
    if (networkValidation.status === 'failure') return;

    const { frameId, urlParams, tabId } = await createConnectingAppSearchParamsWithLastKnownAccount(
      port,
      [
        ['requestId', request.id],
        ['rpcRequest', encodeBase64Json(request)],
        makeNetworkRequestParam(request.params.network),
      ]
    );

    const { id } = await triggerRequestPopupWindowOpen(RouteUrls.RpcStxAddAccount, urlParams);
    void trackRpcRequestSuccess({ endpoint: request.method });

    sendErrorResponseOnUserPopupClose({ frameId, tabId, id, request });
  }
);
