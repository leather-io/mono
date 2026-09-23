import { useCallback, useEffect, useMemo, useState } from 'react';

import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { useField } from 'formik';
import { HStack } from 'leather-styles/jsx';

import {
  FeeTypes,
  type MarketData,
  type Money,
  type Sip10Asset,
  type StacksTransactionFees,
} from '@leather.io/models';
import { baseCurrencyAmountInQuote, convertAmountToBaseUnit, createMoney } from '@leather.io/utils';

import {
  getSbtcSponsorshipFeeTier,
  isSbtcSponsorshipFeeType,
} from '@app/common/transactions/stacks/sbtc-sponsorship.utils';
import { FeeEstimateItem } from '@app/components/fees-row/components/fee-estimate-item';
import { FeeEstimateSelectLayout } from '@app/components/fees-row/components/fee-estimate-select.layout';
import { FeesRowLayout } from '@app/components/fees-row/components/fees-row.layout';
import { SponsoredFeeBadge } from '@app/components/fees-row/components/sponsored-fee-badge';
import { TransactionFee } from '@app/components/fees-row/components/transaction-fee';
import { FeesRow } from '@app/components/fees-row/fees-row';
import { stxFeeCurrency } from '@app/components/fees-row/fees-row.constants';
import { LoadingRectangle } from '@app/components/loading-rectangle';
import {
  isSbtcSponsorshipQuoteExpired,
  useSbtcSponsorshipQuote,
} from '@app/query/sbtc/sbtc-sponsorship.hooks';

const sbtcFeeTypes = [FeeTypes.Low, FeeTypes.Middle, FeeTypes.High];

interface SbtcSponsoredFeesRowProps {
  fees?: StacksTransactionFees;
  asset: Sip10Asset;
  marketData?: MarketData;
  offerSbtcFee: boolean;
  onSelectedSbtcFeeChange(fee: Money | null): void;
}
export function SbtcSponsoredFeesRow({
  fees,
  asset,
  marketData,
  offerSbtcFee,
  onSelectedSbtcFeeChange,
}: SbtcSponsoredFeesRowProps) {
  const [feeField, _, feeHelper] = useField('fee');
  const [feeTypeField, __, feeTypeHelper] = useField('feeType');
  const [feeCurrencyField, ___, feeCurrencyHelper] = useField('feeCurrency');
  const [isSelectVisible, setIsSelectVisible] = useState(false);

  const quote = useSbtcSponsorshipQuote({ enabled: offerSbtcFee });
  const activeQuote =
    quote.data && !isSbtcSponsorshipQuoteExpired(quote.data.expiresAt) ? quote.data : undefined;
  const isSbtcFeeMode = offerSbtcFee && !!activeQuote;

  const isTierSelected = isSbtcSponsorshipFeeType(feeTypeField.value);
  const selectedItem = isTierSelected ? Number(FeeTypes[feeTypeField.value]) : FeeTypes.Middle;
  const selectedTier = getSbtcSponsorshipFeeTier(feeTypeField.value);

  const selectedFee = useMemo(() => {
    if (!isSbtcFeeMode || !activeQuote) return null;
    return createMoney(activeQuote.tiers[selectedTier].feeSats, asset.symbol, asset.decimals);
  }, [activeQuote, asset.decimals, asset.symbol, isSbtcFeeMode, selectedTier]);

  const selectedFeeFiatValue = useMemo(() => {
    if (!selectedFee || !marketData || marketData.pair.base !== selectedFee.symbol) return null;
    return baseCurrencyAmountInQuote(selectedFee, marketData);
  }, [marketData, selectedFee]);

  useEffect(() => {
    onSelectedSbtcFeeChange(selectedFee);
  }, [onSelectedSbtcFeeChange, selectedFee]);

  useEffect(() => {
    if (isSbtcFeeMode || feeCurrencyField.value === stxFeeCurrency) return;
    void feeCurrencyHelper.setValue(stxFeeCurrency);
    void feeTypeHelper.setValue(FeeTypes[FeeTypes.Unknown]);
    void feeHelper.setValue('');
  }, [feeCurrencyField.value, feeCurrencyHelper, feeHelper, feeTypeHelper, isSbtcFeeMode]);

  useEffect(() => {
    if (!selectedFee) return;
    if (!isTierSelected) {
      void feeTypeHelper.setValue(FeeTypes[FeeTypes.Middle]);
      return;
    }
    const nextFee = convertAmountToBaseUnit(selectedFee).toString();
    if (feeField.value !== nextFee) void feeHelper.setValue(nextFee);
    if (feeCurrencyField.value !== selectedFee.symbol)
      void feeCurrencyHelper.setValue(selectedFee.symbol);
  }, [
    feeCurrencyField.value,
    feeCurrencyHelper,
    feeField.value,
    feeHelper,
    feeTypeHelper,
    isTierSelected,
    selectedFee,
  ]);

  const handleSelectFeeType = useCallback(
    (index: number) => {
      void feeTypeHelper.setValue(FeeTypes[index]);
      setIsSelectVisible(false);
    },
    [feeTypeHelper]
  );

  if (!isSbtcFeeMode) {
    if (offerSbtcFee && (quote.isPending || quote.isFetching))
      return <LoadingRectangle height="32px" width="100%" />;
    return <FeesRow fees={fees} isSponsored={false} />;
  }

  if (!selectedFee) return <LoadingRectangle height="32px" width="100%" />;

  return (
    <FeesRowLayout
      data-testid={SharedComponentsSelectors.FeeRow}
      feeField={
        <HStack alignItems="center" gap="space.02" justifyContent="flex-end" width="100%">
          <SponsoredFeeBadge />
          <TransactionFee
            fee={convertAmountToBaseUnit(selectedFee).toString()}
            feeCurrencySymbol={selectedFee.symbol}
            usdAmount={selectedFeeFiatValue}
          />
        </HStack>
      }
      isSponsored={false}
      selectInput={
        <FeeEstimateSelectLayout
          isVisible={isSelectVisible}
          onSetIsSelectVisible={setIsSelectVisible}
          selectedItem={selectedItem}
        >
          {sbtcFeeTypes.map(feeType => (
            <FeeEstimateItem
              key={feeType}
              index={feeType}
              isVisible={isSelectVisible}
              onSelectItem={handleSelectFeeType}
              selectedItem={selectedItem}
            />
          ))}
        </FeeEstimateSelectLayout>
      }
    />
  );
}
