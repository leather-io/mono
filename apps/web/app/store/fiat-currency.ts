import { useAtom } from 'jotai/index';
import { atomWithStorage } from 'jotai/utils';

import { FiatCurrency } from '@leather.io/models';

export const fiatCurrencyAtom = atomWithStorage<FiatCurrency>('fiatCurrency', 'USD');

export function useFiatCurrency() {
  const [fiatCurrency, setFiatCurrency] = useAtom(fiatCurrencyAtom);

  return {
    fiatCurrency,
    setFiatCurrency,
  };
}
