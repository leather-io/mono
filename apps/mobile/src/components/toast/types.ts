import { RefObject } from 'react';

export type ToastType = 'success' | 'info';

export interface ToastData {
  title: string;
  type: ToastType;
}
export interface ToastMethods {
  display({ title, type }: ToastData): unknown;
}
export interface ToastProps {
  toastRef: RefObject<ToastMethods>;
}
