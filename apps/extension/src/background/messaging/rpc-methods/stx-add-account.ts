import { encodeBase64Json, stxAddAccount } from '@leather.io/rpc';

import { RouteUrls } from '@shared/route-urls';

import { trackRpcRequestSuccess } from '../rpc-helpers';
import { defineRpcRequestHandler } from '../rpc-message-handler';
import {
  createConnectingAppMetadataSearchParams,
  sendErrorResponseOnUserPopupClose,
  triggerRequestPopupWindowOpen,
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

    const { urlParams, tabId } = createConnectingAppMetadataSearchParams(port, [
      ['requestId', request.id],
      ['rpcRequest', encodeBase64Json(request)],
    ]);
    if (request.params.network) urlParams.append('network', request.params.network);

    const { id } = await triggerRequestPopupWindowOpen(RouteUrls.RpcStxAddAccount, urlParams);
    void trackRpcRequestSuccess({ endpoint: request.method });

    sendErrorResponseOnUserPopupClose({ tabId, id, request });
  }
);
