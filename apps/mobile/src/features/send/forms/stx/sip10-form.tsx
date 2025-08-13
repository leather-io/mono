import { Controller } from 'react-hook-form';

import { AmountField } from '@/features/send/components/amount-field';
import { AssetDisplay } from '@/features/send/components/asset-display';
import { ErrorMessage } from '@/features/send/components/error-message';
import { Memo } from '@/features/send/components/memo';
import { Numpad } from '@/features/send/components/numpad';
import { Recipient } from '@/features/send/components/recipient/recipient';
import { SendFormContainer, SendFormFooter } from '@/features/send/components/send-form-layout';
import { locale } from '@/features/send/constants';
import { useSendFlowContext } from '@/features/send/send-flow-provider';
import { Account } from '@/store/accounts/accounts';
import { whenInputCurrencyMode } from '@/utils/when-currency-input-mode';
import { t } from '@lingui/core/macro';

import { MarketData, Money, QuoteCurrency, Sip10Asset } from '@leather.io/models';
import { Button, Sip10AvatarIcon } from '@leather.io/ui/native';
import { isNumber } from '@leather.io/utils';

import { useSip10Form } from './use-sip10-form';

interface Sip10FormProps {
  account: Account;
  availableBalance: Money;
  quoteBalance: Money;
  nonce: number | undefined;
  marketData: MarketData;
  quoteCurrency: QuoteCurrency;
  assetItemAnimationOffsetTop?: number | null;
  onOpenAssetPicker(): void;
  asset: Sip10Asset;
}

export function Sip10Form({
  assetItemAnimationOffsetTop,
  availableBalance,
  quoteBalance,
  quoteCurrency,
  marketData,
  nonce,
  onOpenAssetPicker,
  account,
  asset,
}: Sip10FormProps) {
  const {
    state: { inputCurrencyMode },
  } = useSendFlowContext();
  const currency = whenInputCurrencyMode(inputCurrencyMode)({
    crypto: asset.symbol,
    quote: quoteCurrency,
  });
  const { form, schema, maxSpend, onSetMax, onSubmit } = useSip10Form({
    account,
    availableBalance,
    nonce,
    asset,
  });

  return (
    <SendFormContainer>
      <AssetDisplay
        name={asset.name}
        asset={asset}
        availableBalance={availableBalance}
        quoteBalance={quoteBalance}
        icon={
          <Sip10AvatarIcon
            contractId={asset.contractId}
            imageCanonicalUri={asset.imageCanonicalUri}
            name={asset.name}
          />
        }
        onPress={onOpenAssetPicker}
        assetItemElementInitialOffset={assetItemAnimationOffsetTop ?? null}
      />
      <Controller
        render={({ field: { value }, fieldState: { invalid, isValidating } }) => (
          <AmountField
            inputValue={value}
            cryptoCurrency={asset.symbol}
            quoteCurrency={quoteCurrency}
            marketData={marketData}
            invalid={invalid}
            isValidating={isValidating}
            inputCurrencyMode={inputCurrencyMode}
            enteringAnimationEnabled={isNumber(assetItemAnimationOffsetTop)}
            onSetIsSendingMax={() => onSetMax(true)}
            canSendMax={true}
            locale={locale}
            assetDecimals={asset.decimals}
          />
        )}
        control={form.control}
        name="amount"
      />

      <Controller
        control={form.control}
        name="recipient"
        render={({ field: { value, onChange } }) => (
          <Recipient
            asset={asset}
            value={value}
            onChange={onChange}
            recipientSchema={schema.shape.recipient}
          />
        )}
      />

      <Controller
        control={form.control}
        name="memo"
        render={({
          field: { value, onChange, onBlur },
          fieldState: { invalid, error, isDirty, isTouched },
        }) => (
          <Memo
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            invalid={invalid}
            isDirty={isDirty}
            isTouched={isTouched}
            error={error}
          />
        )}
      />

      <ErrorMessage
        amount={form.watch('amount')}
        errorMessage={form.formState.errors.amount?.message}
      />

      <SendFormFooter>
        <Controller
          control={form.control}
          name="amount"
          render={({ field: { value, onChange, onBlur } }) => (
            <Numpad
              clearSendingMax={() => onSetMax(false)}
              spendableAmount={maxSpend}
              currency={currency}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              assetDecimals={asset.decimals}
            />
          )}
        />

        <Button onPress={onSubmit} disabled={!form.formState.isValid}>{t`Review`}</Button>
      </SendFormFooter>
    </SendFormContainer>
  );
}
