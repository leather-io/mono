import { useCallback, useRef } from 'react';

import { useStacksRpcTransactionRequestContext } from './stacks-rpc-transaction-request.context';

export function useStacksRpcTransactionRequestApproval(onApprove: () => Promise<void> | void) {
  const { status, onSetTransactionStatus } = useStacksRpcTransactionRequestContext();
  const isApprovingRef = useRef(false);

  return useCallback(async () => {
    if (isApprovingRef.current || status === 'broadcasting' || status === 'submitted') return;
    isApprovingRef.current = true;
    onSetTransactionStatus('broadcasting');

    try {
      await onApprove();
    } catch (error) {
      onSetTransactionStatus('idle');
      throw error;
    } finally {
      isApprovingRef.current = false;
    }
  }, [onApprove, onSetTransactionStatus, status]);
}
