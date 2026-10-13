import { useCallback, useMemo, useState } from 'react';

import type { ToastProps } from '@leather.io/ui';

export function useToastHandlers() {
  const [toasts, setToasts] = useState(new Map<string, ToastProps>());

  const handleAddToast = useCallback((toast: ToastProps) => {
    setToasts(prev => {
      const newMap = new Map(prev);
      newMap.set(String(Date.now()), { ...toast });
      return newMap;
    });
  }, []);

  return useMemo(() => {
    function handleRemoveToast(key: string) {
      setToasts(prev => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    }

    async function handleDispatchPromise<T>(
      promise: Promise<T>,
      msgs: { success: string; error: string }
    ): Promise<T | undefined> {
      return promise
        .then(data => {
          handleAddToast({ message: msgs.success, variant: 'success' });
          return data;
        })
        .catch(() => {
          handleAddToast({ message: msgs.error, variant: 'error' });
          return undefined;
        });
    }

    return {
      toasts,
      handleRemoveToast,
      handleDispatchInfo: (message: string) => handleAddToast({ message, variant: 'info' }),
      handleDispatchSuccess: (message: string) => handleAddToast({ message, variant: 'success' }),
      handleDispatchError: (message: string) => handleAddToast({ message, variant: 'error' }),
      handleDispatchPromise,
    };
  }, [handleAddToast, toasts]);
}
