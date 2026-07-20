import { type RpcRequest, encodeBase64Json, getAddresses, stxGetAddresses } from '@leather.io/rpc';

import { RouteUrls } from '@shared/route-urls';

import { trackRpcRequestSuccess } from '../rpc-helpers';
import { defineRpcRequestHandler } from '../rpc-message-handler';
import {
  createConnectingAppSearchParamsWithLastKnownAccount,
  makeNetworkRequestParam,
  sendErrorResponseOnUserPopupClose,
  triggerRequestPopupWindowOpen,
  validateRequestNetwork,
} from '../rpc-request-utils';

async function sharedGetAddressesHandler(
  request: RpcRequest<typeof getAddresses> | RpcRequest<typeof stxGetAddresses>,
  port: chrome.runtime.Port
) {
  const networkValidation = await validateRequestNetwork({
    id: request.id,
    method: request.method,
    network: request.params?.network,
    port,
  });
  if (networkValidation.status === 'failure') return;

  const { frameId, urlParams, tabId } = await createConnectingAppSearchParamsWithLastKnownAccount(
    port,
    [
      ['requestId', request.id],
      ['rpcRequest', encodeBase64Json(request)],
      makeNetworkRequestParam(request.params?.network),
    ]
  );

  const { id } = await triggerRequestPopupWindowOpen(RouteUrls.RpcGetAddresses, urlParams);
  void trackRpcRequestSuccess({ endpoint: request.method });

  sendErrorResponseOnUserPopupClose({ frameId, tabId, id, request });
}

export const getAddressesHandler = defineRpcRequestHandler(
  getAddresses.method,
  sharedGetAddressesHandler
);

export const stxGetAddressesHandler = defineRpcRequestHandler(
  stxGetAddresses.method,
  sharedGetAddressesHandler
);
