import { createContext, useContext } from 'react';
import { FieldValues } from 'react-hook-form';

import { ZodTypeAny } from 'zod';

import { CryptoAssetProtocol, CryptoCurrency, Money } from '@leather.io/models';

export interface SendFormBaseContext<T> {
  name: string;
  protocol: CryptoAssetProtocol;
  symbol: CryptoCurrency;
  availableBalance: Money;
  fiatBalance: Money;
  defaultValues: FieldValues;
  schema: ZodTypeAny;
  onInitSendTransfer(data: T, values: any): void;
}

export interface SendFormContext<T> {
  formData: T;
  onSetFormData(key: keyof T, value: T[keyof T]): void;
}

export const sendFormContext = createContext<SendFormContext<any> | null>(null);

export function useSendFormContext<T>() {
  const context = useContext(sendFormContext) as SendFormContext<T>;
  if (!context) throw new Error('`useSendFormContext` must be used within a `SendFormProvider`');
  return context;
}
