import { useEffect, useMemo } from 'react';

import { useField } from 'formik';

import {
  FeeTypes,
  type FlatTransactionFeeQuote,
  type MarketData,
  type Money,
  type Sip10Asset,
  type StacksTransactionFees,
  type TransactionFees,
} from '@leather.io/models';
import { baseCurrencyAmountInQuote, convertAmountToBaseUnit, createMoney } from '@leather.io/utils';

import {
  getSbtcSponsorshipFeeTier,
  isSbtcSponsorshipFeeType,
} from '@app/common/transactions/stacks/sbtc-sponsorship.utils';
import { SponsoredFeeBadge } from '@app/components/fees-row/components/sponsored-fee-badge';
import { FeesRow } from '@app/components/fees-row/fees-row';
import { stxFeeCurrency } from '@app/components/fees-row/fees-row.constants';
import { LoadingRectangle } from '@app/components/loading-rectangle';
import {
  isSbtcSponsorshipQuoteExpired,
  useSbtcSponsorshipQuote,
} from '@app/query/sbtc/sbtc-sponsorship.hooks';

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

  const quote = useSbtcSponsorshipQuote({ enabled: offerSbtcFee });
  const activeQuote =
    quote.data && !isSbtcSponsorshipQuoteExpired(quote.data.expiresAt) ? quote.data : undefined;
  const isSbtcFeeMode = offerSbtcFee && !!activeQuote;
  const feeCurrency = isSbtcFeeMode ? asset.symbol : stxFeeCurrency;

  const sbtcFees = useMemo<TransactionFees<FlatTransactionFeeQuote> | undefined>(() => {
    if (!activeQuote || !isSbtcFeeMode) return undefined;
    function toQuote(feeSats: number): FlatTransactionFeeQuote {
      return { type: 'flat', value: createMoney(feeSats, asset.symbol, asset.decimals) };
    }
    return {
      chain: 'stacks',
      options: {
        low: toQuote(activeQuote.tiers.low.feeSats),
        standard: toQuote(activeQuote.tiers.medium.feeSats),
        high: toQuote(activeQuote.tiers.high.feeSats),
      },
    };
  }, [activeQuote, asset.decimals, asset.symbol, isSbtcFeeMode]);

  const isTierSelected = isSbtcSponsorshipFeeType(feeTypeField.value);
  const selectedFee = useMemo(() => {
    if (!activeQuote || !isSbtcFeeMode) return null;
    const feeSats = activeQuote.tiers[getSbtcSponsorshipFeeTier(feeTypeField.value)].feeSats;
    return createMoney(feeSats, asset.symbol, asset.decimals);
  }, [activeQuote, asset.decimals, asset.symbol, feeTypeField.value, isSbtcFeeMode]);

  const selectedFeeFiatValue = useMemo(() => {
    if (!selectedFee || !marketData || marketData.pair.base !== selectedFee.symbol) return null;
    return baseCurrencyAmountInQuote(selectedFee, marketData);
  }, [marketData, selectedFee]);

  useEffect(() => {
    onSelectedSbtcFeeChange(selectedFee);
  }, [onSelectedSbtcFeeChange, selectedFee]);

  useEffect(() => {
    if (feeCurrencyField.value === feeCurrency) return;
    void feeCurrencyHelper.setValue(feeCurrency);
    void feeTypeHelper.setValue(FeeTypes[FeeTypes.Unknown]);
    void feeHelper.setValue('');
  }, [feeCurrency, feeCurrencyField.value, feeCurrencyHelper, feeHelper, feeTypeHelper]);

  useEffect(() => {
    if (!selectedFee || !isTierSelected) return;
    const nextFee = convertAmountToBaseUnit(selectedFee).toString();
    if (feeField.value !== nextFee) void feeHelper.setValue(nextFee);
  }, [feeField.value, feeHelper, isTierSelected, selectedFee]);

  const isQuoteLoading = offerSbtcFee && !isSbtcFeeMode && (quote.isPending || quote.isFetching);
  const isFeeCurrencySynced = feeCurrencyField.value === feeCurrency;
  if (isQuoteLoading || !isFeeCurrencySynced)
    return <LoadingRectangle height="32px" width="100%" />;

  if (!isSbtcFeeMode) return <FeesRow fees={fees} isSponsored={false} />;

  return (
    <FeesRow
      fees={sbtcFees}
      allowCustom={false}
      isSponsored={false}
      feeBadge={<SponsoredFeeBadge />}
      feeFiatValue={selectedFeeFiatValue}
    />
  );
}
