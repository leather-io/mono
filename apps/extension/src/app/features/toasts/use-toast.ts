import { createContext, useContext } from 'react';

interface ToastContextProps {
  error(this: void, message: string): void;
  info(this: void, message: string): void;
  success(this: void, message: string): void;
  promise<T>(promise: Promise<T>, msgs: { success: string; error: string }): Promise<T | undefined>;
}
export const ToastContext = createContext<ToastContextProps | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastsProvider');
  return context;
}
