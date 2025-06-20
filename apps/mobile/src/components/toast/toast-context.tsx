import { createContext, use, useCallback, useRef } from 'react';

import { HasChildren } from '@leather.io/ui/native';

import { Toast } from '.';
import { ToastData, ToastMethods } from './types';

interface ToastContextType {
  displayToast({ title, type }: ToastData): unknown;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToastContext() {
  const context = use(ToastContext);
  if (!context) throw new Error("'useToastContext' must be used within an ToastWrapper");
  return context;
}

export function ToastWrapper({ children }: HasChildren) {
  const toastRef = useRef<ToastMethods>(null);

  const displayToast = useCallback((toastData: ToastData) => {
    toastRef.current?.display(toastData);
  }, []);

  return (
    <ToastContext.Provider value={{ displayToast }}>
      {children}
      <Toast toastRef={toastRef} />
    </ToastContext.Provider>
  );
}
