import { Controller } from 'react-hook-form';

import { AmountField } from '@/features/send/components/amount-field';
import { AssetDisplay } from '@/features/send/components/asset-display';
import { ErrorMessage } from '@/features/send/components/error-message';
import { Memo } from '@/features/send/components/memo';
import { Numpad } from '@/features/send/components/numpad';
import { Recipient } from '@/features/send/components/recipient/recipient';
import { SendFormContainer, SendFormFooter } from '@/features/send/components/send-form-layout';
import { locale } from '@/features/send/constants';
import { useStxForm } from '@/features/send/forms/stx/use-stx-form';
import { useSendFlowContext } from '@/features/send/send-flow-provider';
import { Account } from '@/store/accounts/accounts';
import { whenInputCurrencyMode } from '@/utils/when-currency-input-mode';
import { t } from '@lingui/macro';

import { stxAsset } from '@leather.io/constants';
import { MarketData, Money, QuoteCurrency } from '@leather.io/models';
import { Button, StxAvatarIcon } from '@leather.io/ui/native';
import { isNumber } from '@leather.io/utils';

const asset = stxAsset;

interface StxFormProps {
  account: Account;
  availableBalance: Money;
  quoteBalance: Money;
  nonce: number | undefined;
  marketData: MarketData;
  quoteCurrency: QuoteCurrency;
  assetItemAnimationOffsetTop?: number | null;
  onOpenAssetPicker(): void;
}

export function StxForm({
  assetItemAnimationOffsetTop,
  availableBalance,
  quoteBalance,
  quoteCurrency,
  marketData,
  nonce,
  onOpenAssetPicker,
  account,
}: StxFormProps) {
  const {
    state: { inputCurrencyMode },
  } = useSendFlowContext();
  const currency = whenInputCurrencyMode(inputCurrencyMode)({
    crypto: asset.symbol,
    quote: quoteCurrency,
  });
  const { form, schema, maxSpend, onSetMax, onSubmit } = useStxForm({
    account,
    availableBalance,
    nonce,
  });

  return (
    <SendFormContainer>
      <AssetDisplay
        name={t({
          id: 'asset_name.stacks',
          message: 'Stacks',
        })}
        asset={asset}
        availableBalance={availableBalance}
        quoteBalance={quoteBalance}
        icon={<StxAvatarIcon />}
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
            />
          )}
        />

        <Button
          onPress={onSubmit}
          disabled={!form.formState.isValid}
          title={t({
            id: 'send_form.review_button',
            message: 'Review',
          })}
        />
      </SendFormFooter>
    </SendFormContainer>
  );
}
