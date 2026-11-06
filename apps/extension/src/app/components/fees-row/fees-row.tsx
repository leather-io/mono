import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import BigNumber from 'bignumber.js';
import { Box } from 'leather-styles/jsx';

import { STX_DECIMALS } from '@leather.io/constants';
import {
  type CryptoCurrency,
  FeeTypes,
  type StacksFeeEstimate,
  type StacksTransactionFees,
} from '@leather.io/models';
import { SkeletonLoader } from '@leather.io/ui';
import { convertAmountToBaseUnit, createMoney, isNumber, isString } from '@leather.io/utils';

import { useConvertCryptoCurrencyToFiatAmount } from '@app/common/hooks/use-convert-to-fiat-amount';

import { CustomFeeField } from './components/custom-fee-field';
import { FeeEstimateSelect } from './components/fee-estimate-select';
import { FeesRowLayout } from './components/fees-row.layout';
import { TransactionFee } from './components/transaction-fee';

function toEstimate(quote: StacksTransactionFees['options']['low']): StacksFeeEstimate {
  return {
    fee: quote.value,
    feeRate: quote.type === 'stacksFeeRate' ? quote.rate : 0,
  };
}

const feeTypesByName: Record<string, unknown> = FeeTypes;
const customFeeTypeIndex: number = FeeTypes.Custom;

function toDisplayableFee(value: unknown) {
  if (isNumber(value) || isString(value)) return value;
  return undefined;
}

function transactionFeesToEstimates(txFees: StacksTransactionFees): StacksFeeEstimate[] {
  const { low, standard, high } = txFees.options;
  return [toEstimate(low), toEstimate(standard), toEstimate(high)];
}

interface FeeRowFormValues {
  fee: unknown;
  feeCurrency: CryptoCurrency;
  feeType: string;
}

interface FeeRowProps {
  fees?: StacksTransactionFees;
  allowCustom?: boolean;
  isSponsored: boolean;
  defaultFeeValue?: number;
  disableFeeSelection?: boolean;
}
export function FeesRow({
  fees,
  isSponsored,
  allowCustom = true,
  defaultFeeValue,
  disableFeeSelection,
}: FeeRowProps) {
  const { setValue, watch } = useFormContext<FeeRowFormValues>();
  const feeValue = watch('fee');
  const feeCurrencySymbol = watch('feeCurrency');
  const feeType = watch('feeType');
  const [fieldWarning, setFieldWarning] = useState<string | undefined>(undefined);
  const [isSelectVisible, setIsSelectVisible] = useState(false);

  const isCustom = feeType === FeeTypes[FeeTypes.Custom];
  const selectedItem = Number(feeTypesByName[feeType]);

  const estimates = useMemo(() => (fees ? transactionFeesToEstimates(fees) : []), [fees]);
  const hasFeeEstimates = estimates.length > 0;

  const convertCryptoCurrencyToUsd = useConvertCryptoCurrencyToFiatAmount(feeCurrencySymbol);

  const feeInUsd = useMemo(() => {
    if ((!isNumber(feeValue) && !isString(feeValue)) || !feeCurrencySymbol) return null;
    const feeAsMoney = createMoney(new BigNumber(feeValue), feeCurrencySymbol);
    return convertCryptoCurrencyToUsd(feeAsMoney);
  }, [convertCryptoCurrencyToUsd, feeCurrencySymbol, feeValue]);

  useEffect(() => {
    if (defaultFeeValue) {
      setValue(
        'fee',
        convertAmountToBaseUnit(new BigNumber(Number(defaultFeeValue)), STX_DECIMALS).toString()
      );
      setValue('feeType', FeeTypes[FeeTypes.Custom]);
    }
  }, [defaultFeeValue, setValue]);

  useEffect(() => {
    if (isSponsored) {
      setValue('fee', 0);
      return;
    }

    if (!defaultFeeValue && hasFeeEstimates && !feeValue && !isCustom) {
      setValue('fee', convertAmountToBaseUnit(estimates[FeeTypes.Middle].fee).toString());
      setValue('feeType', FeeTypes[FeeTypes.Middle]);
      return;
    }
  }, [defaultFeeValue, feeValue, setValue, estimates, hasFeeEstimates, isCustom, isSponsored]);

  const handleSelectFeeEstimateOrCustomField = useCallback(
    (index: number) => {
      setValue('feeType', FeeTypes[index]);
      if (index === customFeeTypeIndex)
        setValue(
          'fee',
          defaultFeeValue
            ? convertAmountToBaseUnit(
                new BigNumber(Number(defaultFeeValue)),
                STX_DECIMALS
              ).toString()
            : ''
        );
      else if (estimates.length > 0)
        setValue('fee', convertAmountToBaseUnit(estimates[index].fee).toString());
      setFieldWarning('');
      setIsSelectVisible(false);
    },
    [setValue, estimates, defaultFeeValue]
  );

  if (!hasFeeEstimates || !fees) return <SkeletonLoader isLoading height="32px" width="100%" />;

  return (
    <FeesRowLayout
      data-testid={SharedComponentsSelectors.FeeRow}
      feeField={
        isCustom ? (
          <CustomFeeField
            disableFeeSelection={disableFeeSelection}
            feeCurrencySymbol={feeCurrencySymbol}
            lowFeeQuote={fees.options.low}
            setFieldWarning={(value: string) => setFieldWarning(value)}
          />
        ) : (
          <Box
            onClick={() => handleSelectFeeEstimateOrCustomField(FeeTypes.Custom)}
            textAlign="right"
            width="100%"
          >
            <TransactionFee
              fee={toDisplayableFee(feeValue)}
              feeCurrencySymbol={feeCurrencySymbol}
              usdAmount={feeInUsd}
            />
          </Box>
        )
      }
      fieldWarning={fieldWarning}
      isSponsored={isSponsored}
      selectInput={
        <FeeEstimateSelect
          disableFeeSelection={disableFeeSelection}
          allowCustom={allowCustom}
          isVisible={isSelectVisible}
          onSelectItem={(index: number) => handleSelectFeeEstimateOrCustomField(index)}
          onSetIsSelectVisible={(value: boolean) => setIsSelectVisible(value)}
          selectedItem={selectedItem}
        />
      }
    />
  );
}
