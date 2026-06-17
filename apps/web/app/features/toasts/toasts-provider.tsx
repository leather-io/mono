import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react';

import { Toast, ToastLayout, type ToastProps } from '@leather.io/ui';

import { ToastContext } from './use-toast';

const toastDurationMs = 2600;

export function ToastsProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Map<string, ToastProps>>(new Map());
  const nextId = useRef(0);

  const addToast = useCallback((toast: ToastProps) => {
    const key = String(nextId.current);
    nextId.current += 1;
    setToasts(prev => new Map(prev).set(key, toast));
  }, []);

  const removeToast = useCallback((key: string) => {
    setToasts(prev => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      success(message: string) {
        addToast({ message, variant: 'success' });
      },
      error(message: string) {
        addToast({ message, variant: 'error' });
      },
      info(message: string) {
        addToast({ message, variant: 'info' });
      },
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={value}>
      <Toast.Provider duration={toastDurationMs}>
        {children}
        {Array.from(toasts).map(([key, toast]) => (
          <Toast.Root
            asChild
            forceMount
            key={key}
            onOpenChange={open => {
              if (!open) removeToast(key);
            }}
          >
            <Toast.Title>
              <ToastLayout message={toast.message} variant={toast.variant} />
            </Toast.Title>
          </Toast.Root>
        ))}
        <Toast.Viewport />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}
