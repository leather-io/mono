import { compileWshDescriptor, isWshDescriptor } from '@leather.io/bitcoin';
import {
  RpcErrorCode,
  btcAddAccount,
  createRpcErrorResponse,
  encodeBase64Json,
} from '@leather.io/rpc';

import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { RouteUrls } from '@shared/route-urls';

import { trackRpcRequestError, trackRpcRequestSuccess } from '../rpc-helpers';
import { defineRpcRequestHandler } from '../rpc-message-handler';
import {
  createConnectingAppSearchParamsWithLastKnownAccount,
  getOriginatingFrameFromPort,
  makeNetworkRequestParam,
  sendErrorResponseOnUserPopupClose,
  triggerRequestPopupWindowOpen,
  validateRequestNetwork,
  validateRequestParams,
} from '../rpc-request-utils';

// Only multisig wsh() descriptors are supported for now. `multi(` is a substring
// of `sortedmulti(`, so this matches both. `compileWshDescriptor` then validates
// the descriptor's structure and throws on anything malformed.
function isSupportedMultisigDescriptor(descriptor: string) {
  if (!isWshDescriptor(descriptor) || !descriptor.includes('multi(')) return false;
  try {
    compileWshDescriptor(descriptor);
    return true;
  } catch {
    return false;
  }
}

export const btcAddAccountHandler = defineRpcRequestHandler(
  btcAddAccount.method,
  async (request, port) => {
    const { status } = validateRequestParams({
      id: request.id,
      method: request.method,
      params: request.params,
      port,
      schema: btcAddAccount.params,
    });
    if (status === 'failure') return;

    const networkValidation = await validateRequestNetwork({
      id: request.id,
      method: request.method,
      network: request.params.network,
      port,
    });
    if (networkValidation.status === 'failure') return;

    if (!isSupportedMultisigDescriptor(request.params.descriptor)) {
      void trackRpcRequestError({ endpoint: request.method, error: 'Invalid descriptor' });
      void sendMessageToOriginatingFrame(
        getOriginatingFrameFromPort(port),
        createRpcErrorResponse(request.method, {
          id: request.id,
          error: {
            code: RpcErrorCode.INVALID_PARAMS,
            message: 'Only multisig wsh() descriptors are supported',
          },
        })
      );
      return;
    }

    const { frameId, urlParams, tabId } = await createConnectingAppSearchParamsWithLastKnownAccount(
      port,
      [
        ['requestId', request.id],
        ['rpcRequest', encodeBase64Json(request)],
        makeNetworkRequestParam(request.params.network),
      ]
    );

    const { id } = await triggerRequestPopupWindowOpen(RouteUrls.RpcBtcAddAccount, urlParams);
    void trackRpcRequestSuccess({ endpoint: request.method });

    sendErrorResponseOnUserPopupClose({ frameId, tabId, id, request });
  }
);
