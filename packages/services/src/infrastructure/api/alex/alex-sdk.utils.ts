import { AlexSdkCurrency } from './alex-sdk.client';

export function stringToAlexSdkCurrency(value: string): AlexSdkCurrency {
  return value as AlexSdkCurrency;
}
