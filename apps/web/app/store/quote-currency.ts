import { useAtom } from 'jotai/index';
import { atomWithStorage } from 'jotai/utils';

import { QuoteCurrency } from '@leather.io/models';

export const quoteCurrencyAtom = atomWithStorage<QuoteCurrency>('quoteCurrency', 'USD');

export function useQuoteCurrency() {
  const [quoteCurrency, setQuoteCurrency] = useAtom(quoteCurrencyAtom);

  return {
    quoteCurrency,
    setQuoteCurrency,
  };
}
