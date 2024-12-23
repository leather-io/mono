import { RefObject } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBtcMarketDataQuery } from '@/queries/market-data/btc-market-data.query';
import { useSettings } from '@/store/settings/settings';
import { useTheme } from '@shopify/restyle';
import BigNumber from 'bignumber.js';

import { AverageBitcoinFeeRates, FeeTypes } from '@leather.io/models';
import { Box, Sheet, SheetRef, Theme } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuoteWithFallback, createMoney, match } from '@leather.io/utils';

import { FeeOption } from './fee-options';

const feeTypeArr = [FeeTypes.Low, FeeTypes.Middle, FeeTypes.High, FeeTypes.Custom];

interface FeesSheetProps {
  sheetRef: RefObject<SheetRef>;
  selectedFeeType: FeeTypes;
  setSelectedFeeType(feeType: FeeTypes): void;
  fees: AverageBitcoinFeeRates | undefined;
  txSize: number;
  currentFeeRate: number;
  onChangeFee(feeType: FeeTypes): void;
}

export function FeesSheet({
  sheetRef,
  selectedFeeType,
  setSelectedFeeType,
  fees,
  txSize,
  currentFeeRate,
  onChangeFee,
}: FeesSheetProps) {
  const { bottom } = useSafeAreaInsets();
  const { themeDerivedFromThemePreference } = useSettings();
  const theme = useTheme<Theme>();
  const { data: btcMarketData } = useBtcMarketDataQuery();

  function getUsd(fee: number) {
    if (!fee) return createMoney(0, 'USD');
    const btcBalance = createMoney(fee, 'BTC');
    const usdBalance = baseCurrencyAmountInQuoteWithFallback(btcBalance, btcMarketData);
    return usdBalance;
  }

  function getFee(feeType: FeeTypes) {
    const feeRate = match<FeeTypes>()(feeType, {
      [FeeTypes.Low]: fees?.hourFee ?? BigNumber(0),
      [FeeTypes.Middle]: fees?.halfHourFee ?? BigNumber(0),
      [FeeTypes.High]: fees?.fastestFee ?? BigNumber(0),
      [FeeTypes.Unknown]: BigNumber(0),
      [FeeTypes.Custom]: BigNumber(currentFeeRate),
    });
    const fee = txSize * feeRate.toNumber();
    return { feeRate, fee };
  }

  return (
    <Sheet isScrollView ref={sheetRef} themeVariant={themeDerivedFromThemePreference}>
      <Box
        style={{
          paddingBottom: theme.spacing[5] + bottom,
          paddingTop: theme.spacing[4],
        }}
        gap="3"
        p="3"
      >
        {feeTypeArr.map(feeType => {
          const { feeRate, fee } = getFee(feeType);
          return (
            <FeeOption
              isSelected={selectedFeeType === feeType}
              disabled={feeType === FeeTypes.Custom}
              onPress={() => {
                setSelectedFeeType(feeType);
                onChangeFee(feeType);
              }}
              key={feeType}
              feeType={feeType}
              feeRate={feeRate.toNumber()}
              fee={fee}
              usd={getUsd(fee)}
            />
          );
        })}
      </Box>
    </Sheet>
  );
}
