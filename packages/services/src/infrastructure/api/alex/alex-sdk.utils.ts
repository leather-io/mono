import { AlexSdkCurrency } from './alex-sdk.client';

export function stringToAlexSdkCurrency(value: string): AlexSdkCurrency {
  return value as AlexSdkCurrency;
}

export function isAlexSdkCurrency(value: string): value is AlexSdkCurrency {
  return typeof value === 'string' && value.length > 0;
}
