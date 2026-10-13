import { createContext, useContext } from 'react';

interface ToastContextValue {
  success(message: string): void;
  error(message: string): void;
  info(message: string): void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastsProvider');
  return context;
}
