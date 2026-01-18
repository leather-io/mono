import { useMemo, useRef } from 'react';

import { currencyDecimalsMap } from '@leather.io/constants';
import {
  type Currency,
  type MarketData,
  type Money,
  whenInputCurrencyMode,
} from '@leather.io/models';
import {
  baseCurrencyAmountInQuote,
  createMoneyFromDecimal,
  quoteCurrencyAmountToBase,
} from '@leather.io/utils';

import { type SwapInternalState } from '../swap-state.types';

/**
 * Converts user input (string) to both crypto and quote Money amounts based on the current input mode.
 *
 * When user types in crypto mode: parses crypto amount directly, converts to quote using market data.
 * When user types in quote mode: parses quote amount directly, converts to crypto using market data.
 *
 * The lock mechanism prevents conversion drift when toggling between input modes. Without locking,
 * switching BTC -> USD -> BTC would show a different BTC value due to market data precision (subcents).
 * By locking amounts for one render cycle, the UI can toggle modes while displaying the exact same
 * values, ensuring a seamless user experience.
 */
export function useDerivedAmounts(state: SwapInternalState, marketData: MarketData | undefined) {
  const suspend = useRef(false);
  const lockRef = useRef<{ crypto: Money | null; quote: Money | null } | null>(null);
  const { baseSwapAsset, inputCurrencyMode, baseAmount, quoteCurrencyPreference } = state;

  const derivedAmounts = useMemo(() => {
    if (suspend.current && lockRef.current) {
      suspend.current = false;
      return lockRef.current;
    }

    if (!baseSwapAsset) {
      return { crypto: null, quote: null };
    }

    return whenInputCurrencyMode(inputCurrencyMode)({
      crypto: () => {
        const crypto = parseEditingValue(
          baseAmount,
          baseSwapAsset.asset.symbol,
          baseSwapAsset.asset.decimals
        );
        const quote = convertCryptoToQuote(crypto, marketData);
        return { crypto, quote };
      },
      quote: () => {
        const quote = parseEditingValue(
          baseAmount,
          quoteCurrencyPreference,
          currencyDecimalsMap[quoteCurrencyPreference] ?? 2
        );
        const crypto = convertQuoteToCrypto(quote, marketData, baseSwapAsset.asset.decimals);
        return { crypto, quote };
      },
    })();
  }, [baseSwapAsset, inputCurrencyMode, baseAmount, quoteCurrencyPreference, marketData]);

  return {
    derivedAmounts,
    lockDerivedAmountsForNextRender: () => {
      lockRef.current = derivedAmounts;
      suspend.current = true;
    },
  };
}

function parseEditingValue(value: string, symbol: Currency, decimals: number) {
  if (!value) return null;
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) return null;
  try {
    return createMoneyFromDecimal(numericValue, symbol, decimals);
  } catch {
    return null;
  }
}

function convertCryptoToQuote(
  cryptoAmount: Money | null,
  marketData: MarketData | undefined
): Money | null {
  if (!marketData || !cryptoAmount) return null;

  try {
    return baseCurrencyAmountInQuote(cryptoAmount, marketData);
  } catch {
    return null;
  }
}

function convertQuoteToCrypto(
  quoteAmount: Money | null,
  marketData: MarketData | undefined,
  decimals: number
): Money | null {
  if (!marketData || !quoteAmount) return null;

  try {
    return quoteCurrencyAmountToBase(quoteAmount, marketData, decimals);
  } catch {
    return null;
  }
}
