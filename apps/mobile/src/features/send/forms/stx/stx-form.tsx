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

import { stxCryptoAsset } from '@leather.io/constants';
import { FiatCurrency, MarketData, Money } from '@leather.io/models';
import { Button, StxAvatarIcon } from '@leather.io/ui/native';
import { isNumber } from '@leather.io/utils';

const assetInfo = stxCryptoAsset;

interface StxFormProps {
  account: Account;
  availableBalance: Money;
  fiatBalance: Money;
  nonce: number | undefined;
  marketData: MarketData;
  fiatCurrency: FiatCurrency;
  assetItemAnimationOffsetTop?: number | null;
  onOpenAssetPicker(): void;
}

export function StxForm({
  assetItemAnimationOffsetTop,
  availableBalance,
  fiatBalance,
  fiatCurrency,
  marketData,
  nonce,
  onOpenAssetPicker,
  account,
}: StxFormProps) {
  const {
    state: { inputCurrencyMode },
  } = useSendFlowContext();
  const currency = whenInputCurrencyMode(inputCurrencyMode)({
    crypto: assetInfo.symbol,
    fiat: fiatCurrency,
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
        assetInfo={assetInfo}
        availableBalance={availableBalance}
        fiatBalance={fiatBalance}
        icon={<StxAvatarIcon />}
        onPress={onOpenAssetPicker}
        assetItemElementInitialOffset={assetItemAnimationOffsetTop ?? null}
      />
      <Controller
        render={({ field: { value }, fieldState: { invalid, isValidating } }) => (
          <AmountField
            inputValue={value}
            cryptoCurrency={assetInfo.symbol}
            fiatCurrency={fiatCurrency}
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
            assetInfo={assetInfo}
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
        isValidating={form.formState.isValidating}
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
