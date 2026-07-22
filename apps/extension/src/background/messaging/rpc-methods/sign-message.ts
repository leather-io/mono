import { isSupportedMessageSigningPaymentType } from '@leather.io/bitcoin';
import { RpcErrorCode, createRpcErrorResponse, signMessage } from '@leather.io/rpc';
import { isDefined, isUndefined } from '@leather.io/utils';

import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { RouteUrls } from '@shared/route-urls';
import {
  getRpcSignMessageParamErrors,
  validateRpcSignMessageParams,
} from '@shared/rpc/methods/sign-message';

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

export const signMessageHandler = defineRpcRequestHandler(
  signMessage.method,
  async (request, port) => {
    if (isUndefined(request.params)) {
      void trackRpcRequestError({ endpoint: 'signMessage', error: 'Undefined parameters' });
      void sendMessageToOriginatingFrame(
        getOriginatingFrameFromPort(port),
        createRpcErrorResponse('signMessage', {
          id: request.id,
          error: { code: RpcErrorCode.INVALID_REQUEST, message: 'Parameters undefined' },
        })
      );
      return;
    }

    if (!validateRpcSignMessageParams(request.params)) {
      void trackRpcRequestError({ endpoint: 'signMessage', error: 'Invalid parameters' });

      void sendMessageToOriginatingFrame(
        getOriginatingFrameFromPort(port),
        createRpcErrorResponse('signMessage', {
          id: request.id,
          error: {
            code: RpcErrorCode.INVALID_PARAMS,
            message: getRpcSignMessageParamErrors(request.params),
          },
        })
      );
      return;
    }

    const paymentType = request.params.paymentType ?? 'p2wpkh';

    if (!isSupportedMessageSigningPaymentType(paymentType)) {
      void trackRpcRequestError({ endpoint: 'signMessage', error: 'Unsupported payment type' });

      void sendMessageToOriginatingFrame(
        getOriginatingFrameFromPort(port),
        createRpcErrorResponse('signMessage', {
          id: request.id,
          error: {
            code: RpcErrorCode.INVALID_PARAMS,
            message:
              'Unsupported payment type. Leather only supports signing messages for Native Segwit (p2wpkh) and Taproot (p2tr) addresses.',
          },
        })
      );
      return;
    }

    const networkValidation = await validateRequestNetwork({
      id: request.id,
      method: request.method,
      network: request.params.network,
      port,
    });
    if (networkValidation.status === 'failure') return;

    void trackRpcRequestSuccess({ endpoint: request.method });

    const requestParams: RequestParams = [
      ['message', request.params.message],
      ['paymentType', paymentType],
      ['requestId', request.id],
    ];

    if (isDefined(request.params.account)) {
      requestParams.push(['accountIndex', request.params.account.toString()]);
    }

    const { frameId, urlParams, tabId } = await createConnectingAppSearchParamsWithLastKnownAccount(
      port,
      requestParams,
      { network: request.params.network }
    );
    const { id } = await triggerRequestPopupWindowOpen(RouteUrls.RpcSignBip322Message, urlParams);

    sendErrorResponseOnUserPopupClose({ frameId, tabId, id, request });
  }
);
