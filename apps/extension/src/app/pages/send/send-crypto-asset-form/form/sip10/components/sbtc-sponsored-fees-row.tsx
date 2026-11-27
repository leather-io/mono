import { useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import {
  FeeTypes,
  type FlatTransactionFeeQuote,
  type MarketData,
  type Money,
  type Sip10Asset,
  type StacksTransactionFees,
  type TransactionFees,
} from '@leather.io/models';
import type { SbtcSponsorshipQuoteResponse } from '@leather.io/services';
import { SkeletonLoader } from '@leather.io/ui';
import { baseCurrencyAmountInQuote, convertAmountToBaseUnit, createMoney } from '@leather.io/utils';

import { type StacksSendFormValues } from '@shared/models/form.model';

import {
  getSbtcSponsorshipFeeSats,
  getSbtcSponsorshipFeeTier,
  isSbtcSponsorshipFeeType,
} from '@app/common/transactions/stacks/sbtc-sponsorship.utils';
import { SponsoredFeeBadge } from '@app/components/fees-row/components/sponsored-fee-badge';
import { FeesRow, stxFeeCurrency } from '@app/components/fees-row/fees-row';
import {
  isSbtcSponsorshipQuoteExpired,
  useSbtcSponsorshipQuote,
} from '@app/query/sbtc/sbtc-sponsorship.hooks';

function createSbtcFeeQuote(
  stxFee: Money,
  quote: SbtcSponsorshipQuoteResponse,
  asset: Sip10Asset
): FlatTransactionFeeQuote {
  const feeSats = getSbtcSponsorshipFeeSats(stxFee.amount, quote);
  return { type: 'flat', value: createMoney(feeSats, asset.symbol, asset.decimals) };
}

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
  const { setValue, watch } = useFormContext<StacksSendFormValues>();
  const feeValue = watch('fee');
  const feeType = watch('feeType');
  const feeCurrencyValue = watch('feeCurrency');

  const quote = useSbtcSponsorshipQuote({ enabled: offerSbtcFee });
  const activeQuote =
    quote.data && !isSbtcSponsorshipQuoteExpired(quote.data.expiresAt) ? quote.data : undefined;
  const isSbtcFeeMode = offerSbtcFee && !!activeQuote;
  const feeCurrency = isSbtcFeeMode ? asset.symbol : stxFeeCurrency;

  const sbtcFees = useMemo<TransactionFees<FlatTransactionFeeQuote> | undefined>(() => {
    if (!activeQuote || !isSbtcFeeMode || !fees) return undefined;
    return {
      chain: 'stacks',
      options: {
        low: createSbtcFeeQuote(fees.options.low.value, activeQuote, asset),
        standard: createSbtcFeeQuote(fees.options.standard.value, activeQuote, asset),
        high: createSbtcFeeQuote(fees.options.high.value, activeQuote, asset),
      },
    };
  }, [activeQuote, asset, fees, isSbtcFeeMode]);

  const isTierSelected = isSbtcSponsorshipFeeType(feeType);
  const selectedFee = useMemo(() => {
    if (!sbtcFees) return null;
    return sbtcFees.options[getSbtcSponsorshipFeeTier(feeType)].value;
  }, [feeType, sbtcFees]);

  const selectedFeeFiatValue = useMemo(() => {
    if (!selectedFee || !marketData || marketData.pair.base !== selectedFee.symbol) return null;
    return baseCurrencyAmountInQuote(selectedFee, marketData);
  }, [marketData, selectedFee]);

  useEffect(() => {
    onSelectedSbtcFeeChange(selectedFee);
  }, [onSelectedSbtcFeeChange, selectedFee]);

  useEffect(() => {
    if (feeCurrencyValue === feeCurrency) return;
    setValue('feeCurrency', feeCurrency);
    setValue('feeType', FeeTypes[FeeTypes.Unknown]);
    setValue('fee', '');
  }, [feeCurrency, feeCurrencyValue, setValue]);

  useEffect(() => {
    if (!selectedFee || !isTierSelected) return;
    const nextFee = convertAmountToBaseUnit(selectedFee).toString();
    if (feeValue !== nextFee) setValue('fee', nextFee);
  }, [feeValue, isTierSelected, selectedFee, setValue]);

  const isQuoteLoading = offerSbtcFee && !isSbtcFeeMode && (quote.isPending || quote.isFetching);
  const isFeeCurrencySynced = feeCurrencyValue === feeCurrency;
  if (isQuoteLoading || !isFeeCurrencySynced)
    return <SkeletonLoader isLoading height="32px" width="100%" />;

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
