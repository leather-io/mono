import { createContext, useCallback, useContext, useRef } from 'react';

import { HasChildren } from '@/utils/types';

import { Toast } from '.';
import { ToastData, ToastMethods } from './types';

export interface ToastContextType {
  displayToast({ title, type }: ToastData): unknown;
}

export const ToastContext = createContext<ToastContextType>({
  displayToast: () => {},
});
export function useToastContext() {
  return useContext(ToastContext);
}
export function ToastWrapper({ children }: HasChildren) {
  const toastRef = useRef<ToastMethods>(null);

  const displayToast = useCallback(
    (toastData: ToastData) => {
      toastRef.current?.display(toastData);
    },
    [toastRef.current]
  );
  return (
    <ToastContext.Provider value={{ displayToast }}>
      {children}
      <Toast toastRef={toastRef} />
    </ToastContext.Provider>
  );
}
