import {
  RpcErrorCode,
  type RpcRequest,
  createRpcErrorResponse,
  encodeBase64Json,
  getAddresses,
  stxGetAddresses,
} from '@leather.io/rpc';
import { isDefined } from '@leather.io/utils';

import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { RouteUrls } from '@shared/route-urls';
import {
  getRpcParamErrorsFormatted,
  validateRpcParams,
} from '@shared/rpc/methods/validation.utils';

import { trackRpcRequestError, trackRpcRequestSuccess } from '../rpc-helpers';
import { defineRpcRequestHandler } from '../rpc-message-handler';
import {
  type RequestSender,
  createConnectingAppMetadataSearchParams,
  getOriginatingFrameFromPort,
  sendErrorResponseOnUserPopupClose,
  triggerRequestPopupWindowOpen,
} from '../rpc-request-utils';

type GetAddressesRequest = RpcRequest<typeof getAddresses> | RpcRequest<typeof stxGetAddresses>;

function createInvalidParamsResponse(request: GetAddressesRequest, message: string) {
  const error = { code: RpcErrorCode.INVALID_PARAMS, message };
  if (request.method === 'stx_getAddresses')
    return createRpcErrorResponse('stx_getAddresses', { id: request.id, error });
  return createRpcErrorResponse('getAddresses', { id: request.id, error });
}

async function sharedGetAddressesHandler(request: GetAddressesRequest, port: RequestSender) {
  const paramsSchema =
    request.method === 'stx_getAddresses' ? stxGetAddresses.params : getAddresses.params;

  if (isDefined(request.params) && !validateRpcParams(request.params, paramsSchema)) {
    void trackRpcRequestError({ endpoint: request.method, error: 'Invalid parameters' });
    void sendMessageToOriginatingFrame(
      getOriginatingFrameFromPort(port),
      createInvalidParamsResponse(request, getRpcParamErrorsFormatted(request.params, paramsSchema))
    );
    return;
  }

  const { frameId, urlParams, tabId } = createConnectingAppMetadataSearchParams(port, [
    ['requestId', request.id],
    ['rpcRequest', encodeBase64Json(request)],
  ]);

  if (request.params && request.params.network) {
    urlParams.append('network', request.params.network);
  }

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
