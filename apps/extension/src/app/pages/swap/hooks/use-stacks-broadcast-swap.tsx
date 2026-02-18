import { useCallback } from 'react';

import type { StacksTransactionWire } from '@stacks/transactions';

import { isError, isString } from '@leather.io/utils';

import { logger } from '@shared/logger';
import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useSubmitTransactionCallback } from '@app/common/hooks/use-submit-stx-transaction';
import { useToast } from '@app/features/toasts/use-toast';
import { useNavigate } from '@app/routes/compat';
import { useAppDispatch } from '@app/store';
import { miscNavigationSlice } from '@app/store/navigation/misc-navigation.slice';
import { LoadingKeys, useLoading } from '@app/store/ui/ui.hooks';

export function useStacksBroadcastSwap() {
  const { setIsIdle } = useLoading(LoadingKeys.SUBMIT_SWAP_TRANSACTION);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const broadcastTransactionFn = useSubmitTransactionCallback({
    loadingKey: LoadingKeys.SUBMIT_SWAP_TRANSACTION,
  });

  return useCallback(
    async (signedTx: StacksTransactionWire) => {
      if (!signedTx) {
        logger.error('Cannot broadcast transaction, no tx in state');
        toast.error('Unable to broadcast transaction');
        return;
      }
      try {
        await broadcastTransactionFn({
          onError(e: Error | string) {
            setIsIdle();
            const message = isString(e) ? e : e.message;
            dispatch(miscNavigationSlice.actions.setErrorState({ message, title: '' }));
            return navigate(RouteUrls.BroadcastError);
          },
          onSuccess(txId) {
            toast.success('Transaction submitted!');
            setIsIdle();
            analytics.untypedTrack('stacks_swap_succeeded', { txid: txId });
            return navigate(RouteUrls.Activity);
          },
          replaceByFee: false,
        })(signedTx);
      } catch (e) {
        setIsIdle();
        analytics.untypedTrack('stacks_swap_failed', { error: e });
        dispatch(
          miscNavigationSlice.actions.setErrorState({
            message: isError(e) ? e.message : 'Unknown error',
            title: '',
          })
        );
        return navigate(RouteUrls.BroadcastError);
      } finally {
        setIsIdle();
      }
    },
    [toast, broadcastTransactionFn, setIsIdle, navigate, dispatch]
  );
}
