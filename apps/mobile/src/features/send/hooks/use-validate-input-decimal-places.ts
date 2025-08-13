import { useCallback } from 'react';

import { validateDecimalPlaces } from '@/features/send/utils';

import { currencyDecimalsMap } from '@leather.io/constants';
import { Currency } from '@leather.io/models';

const allowedDecimalPlacesFallback = 2;

export function useValidateInputDecimalPlaces(currency: Currency, decimals?: number) {
  return useCallback(
    (value: string) =>
      validateDecimalPlaces(
        value,
        currencyDecimalsMap[currency] ?? decimals ?? allowedDecimalPlacesFallback
      ),
    [currency, decimals]
  );
}
