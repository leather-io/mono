import { serializeCV } from '@stacks/transactions';

import {
  RpcErrorCode,
  type RpcRequest,
  type StxSignMessageRequestParamsStructured,
  createRpcErrorResponse,
  stxSignMessage,
  stxSignStructuredMessage,
} from '@leather.io/rpc';
import { isString, isUndefined } from '@leather.io/utils';

import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { RouteUrls } from '@shared/route-urls';
import {
  getRpcSignStacksMessageParamErrors,
  validateRpcSignStacksMessageParams,
} from '@shared/rpc/methods/sign-stacks-message';

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

async function handleRpcSignStacksMessage(
  method: 'stx_signMessage' | 'stx_signStructuredMessage',
  request: RpcRequest<typeof stxSignMessage> | RpcRequest<typeof stxSignStructuredMessage>,
  port: chrome.runtime.Port,
  buildPopupParams: () => { requestParams: RequestParams; network: string | undefined }
) {
  if (isUndefined(request.params)) {
    void trackRpcRequestError({ endpoint: method, error: 'Undefined parameters' });
    void sendMessageToOriginatingFrame(
      getOriginatingFrameFromPort(port),
      createRpcErrorResponse(method, {
        id: request.id,
        error: { code: RpcErrorCode.INVALID_REQUEST, message: 'Parameters undefined' },
      })
    );
    return;
  }

  if (!validateRpcSignStacksMessageParams(request.params)) {
    void trackRpcRequestError({ endpoint: method, error: 'Invalid parameters' });
    void sendMessageToOriginatingFrame(
      getOriginatingFrameFromPort(port),
      createRpcErrorResponse(method, {
        id: request.id,
        error: {
          code: RpcErrorCode.INVALID_PARAMS,
          message: getRpcSignStacksMessageParamErrors(request.params),
        },
      })
    );
    return;
  }

  const { requestParams, network } = buildPopupParams();

  const networkValidation = await validateRequestNetwork({ id: request.id, method, network, port });
  if (networkValidation.status === 'failure') return;

  void trackRpcRequestSuccess({ endpoint: method });

  const { frameId, urlParams, tabId } = await createConnectingAppSearchParamsWithLastKnownAccount(
    port,
    requestParams,
    { network }
  );

  const { id } = await triggerRequestPopupWindowOpen(RouteUrls.RpcStacksSignature, urlParams);
  sendErrorResponseOnUserPopupClose({ frameId, tabId, id, request });
}
export const stxSignMessageHandler = defineRpcRequestHandler(
  stxSignMessage.method,
  async (request, port) => {
    return handleRpcSignStacksMessage(request.method, request, port, () => {
      const requestParams: RequestParams = [
        ['message', request.params.message],
        ['messageType', request.params.messageType ?? 'utf8'],
        ['requestId', request.id],
      ];

      if ('domain' in request.params) {
        requestParams.push([
          'domain',
          (request.params as StxSignMessageRequestParamsStructured).domain.toString(),
        ]);
      }

      return { requestParams, network: request.params.network };
    });
  }
);

export const stxSignStructuredMessageHandler = defineRpcRequestHandler(
  stxSignStructuredMessage.method,
  async (request, port) => {
    return handleRpcSignStacksMessage(request.method, request, port, () => {
      const requestParams: RequestParams = [
        ['requestId', request.id],
        ['messageType', 'structured'],
        [
          'message',
          isString(request.params.message)
            ? request.params.message
            : serializeCV(request.params.message),
        ],
        [
          'domain',
          isString(request.params.domain)
            ? request.params.domain
            : serializeCV(request.params.domain),
        ],
      ];

      return { requestParams, network: request.params.network };
    });
  }
);
