import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { AuthType, type StacksTransactionWire } from '@stacks/transactions';

import {
  RpcErrorCode,
  type RpcMethodNames,
  createRpcErrorResponse,
  createRpcSuccessResponse,
} from '@leather.io/rpc';
import { delay, isString } from '@leather.io/utils';

import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { RouteUrls } from '@shared/route-urls';
import { RpcErrorMessage } from '@shared/rpc/methods/validation.utils';
import { closeWindow } from '@shared/utils';

import { stacksBroadcastTransaction } from '@app/common/transactions/stacks/stacks-broadcast-transaction';
import { createError } from '@app/common/utils';
import { useAnalyticsOnlyStacksNonceTracker } from '@app/components/loaders/stacks-nonce-loader';
import { useCurrentStacksNetworkState } from '@app/store/networks/networks.hooks';
import { useSignStacksTransaction } from '@app/store/transactions/transaction.hooks';

import { useStacksRpcTransactionRequestContext } from './stacks-rpc-transaction-request.context';

export function useSignAndBroadcastStacksTransaction(method: RpcMethodNames) {
  const { onSetTransactionStatus, tabId, requestId, frameId } =
    useStacksRpcTransactionRequestContext();
  const signStacksTransaction = useSignStacksTransaction();
  const network = useCurrentStacksNetworkState();
  const navigate = useNavigate();
  const { trackIfNonceError } = useAnalyticsOnlyStacksNonceTracker();

  return useCallback(
    async (unsignedTx: StacksTransactionWire) => {
      const signedTx = await signStacksTransaction(unsignedTx);

      if (!signedTx) {
        void sendMessageToOriginatingFrame(
          { frameId, tabId },
          createRpcErrorResponse(method, {
            id: requestId,
            error: {
              code: RpcErrorCode.INVALID_REQUEST,
              message: RpcErrorMessage.UnsignedTransaction,
            },
          })
        );
        throw createError({
          name: 'TransactionReturnedFromSignerNull',
          message: 'Unable to sign transaction',
        });
      }

      // If the transaction is sponsored, we do not broadcast it
      const isSponsored = signedTx.auth?.authType === AuthType.Sponsored;
      if (isSponsored) {
        void sendMessageToOriginatingFrame(
          { frameId, tabId },
          createRpcSuccessResponse(method, {
            id: requestId,
            result: {
              transaction: signedTx.serialize(),
            },
          })
        );
        await delay(500);
        closeWindow();
      }

      function onError(error: Error | string) {
        const message = isString(error) ? error : error.message;
        trackIfNonceError(unsignedTx, error);

        return navigate(RouteUrls.BroadcastError, { state: { message } });
      }

      async function onSuccess(txid: string, transaction: StacksTransactionWire) {
        onSetTransactionStatus('submitted');

        void sendMessageToOriginatingFrame(
          { frameId, tabId },
          createRpcSuccessResponse(method, {
            id: requestId,
            result: {
              txid,
              transaction: transaction.serialize(),
            },
          })
        );
        await delay(250);
        closeWindow();
      }

      onSetTransactionStatus('broadcasting');
      await stacksBroadcastTransaction({ network, signedTx, onError, onSuccess });
      onSetTransactionStatus('idle');
    },
    [
      method,
      frameId,
      navigate,
      network,
      onSetTransactionStatus,
      requestId,
      signStacksTransaction,
      tabId,
      trackIfNonceError,
    ]
  );
}
