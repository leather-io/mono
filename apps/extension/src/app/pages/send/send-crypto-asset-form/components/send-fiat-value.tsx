import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { styled } from 'leather-styles/jsx';

import type { MarketData, Money } from '@leather.io/models';
import { baseCurrencyAmountInQuote, createMoneyFromDecimal, isNumber } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';

interface SendFiatInputProps {
  marketData: MarketData;
  assetSymbol?: string;
  assetDecimals?: number;
}

export function SendFiatValue({ marketData, assetSymbol = '', assetDecimals }: SendFiatInputProps) {
  const { watch } = useFormContext<{ amount: string | number }>();
  const amountValue = watch('amount');
  const [assetValue, setAssetValue] = useState<Money>(
    createMoneyFromDecimal(0, assetSymbol, assetDecimals)
  );

  useEffect(() => {
    let amount = Number(amountValue);

    if (isNaN(amount) || !isNumber(amount) || amount < 0) {
      amount = 0;
    }

    const assetAmount = createMoneyFromDecimal(amount, assetSymbol, assetDecimals);
    setAssetValue(assetAmount);
  }, [amountValue, assetSymbol, assetDecimals]);

  return (
    <styled.span textStyle="body.02" color="ink.text-subdued">
      {Number(amountValue) > 0 && '~'}{' '}
      {formatCurrency(baseCurrencyAmountInQuote(assetValue, marketData))}
    </styled.span>
  );
}
