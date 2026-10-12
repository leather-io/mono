import { useCallback, useMemo, useRef, useState } from 'react';

import type { ToastProps } from '@leather.io/ui';

import type { ToastOptions } from './use-toast';

export interface ExtensionToast extends ToastProps, ToastOptions {}

export function useToastHandlers() {
  const [toasts, setToasts] = useState(new Map<string, ExtensionToast>());
  const nextToastId = useRef(0);

  const handleAddToast = useCallback((toast: ExtensionToast) => {
    const key = String(nextToastId.current);
    nextToastId.current += 1;
    setToasts(prev => {
      const newMap = new Map(prev);
      newMap.set(key, { ...toast });
      return newMap;
    });
  }, []);

  return useMemo(() => {
    return {
      toasts,
      handleRemoveToast: (key: string) => {
        setToasts(prev => {
          const newMap = new Map(prev);
          newMap.delete(key);
          return newMap;
        });
      },
      handleDispatchInfo: (message: string) => handleAddToast({ message, variant: 'info' }),
      handleDispatchSuccess: (message: string, options?: ToastOptions) =>
        handleAddToast({ message, variant: 'success', ...options }),
      handleDispatchError: (message: string) => handleAddToast({ message, variant: 'error' }),
      handleDispatchPromise: async (
        promise: Promise<any>,
        msgs: { success: string; error: string }
      ) => {
        return promise
          .then(data => {
            handleAddToast({ message: msgs.success, variant: 'success' });
            return data;
          })
          .catch(() => {
            handleAddToast({ message: msgs.error, variant: 'error' });
          });
      },
    };
  }, [handleAddToast, toasts]);
}
