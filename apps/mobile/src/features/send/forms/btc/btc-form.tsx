import { Controller } from 'react-hook-form';

import { AmountField } from '@/features/send/components/amount-field';
import { AssetDisplay } from '@/features/send/components/asset-display';
import { ErrorMessage } from '@/features/send/components/error-message';
import { Numpad } from '@/features/send/components/numpad';
import { Recipient } from '@/features/send/components/recipient/recipient';
import { SendFormContainer, SendFormFooter } from '@/features/send/components/send-form-layout';
import { locale } from '@/features/send/constants';
import { useBtcForm } from '@/features/send/forms/btc/use-btc-form';
import { useSendFlowContext } from '@/features/send/send-flow-provider';
import { type Account } from '@/store/accounts/accounts';
import { whenInputCurrencyMode } from '@/utils/when-currency-input-mode';
import { t } from '@lingui/macro';

import { btcCryptoAsset } from '@leather.io/constants';
import {
  type AverageBitcoinFeeRates,
  type FiatCurrency,
  type MarketData,
  type Money,
  type OwnedUtxo,
} from '@leather.io/models';
import { BtcAvatarIcon, Button } from '@leather.io/ui/native';
import { isNumber } from '@leather.io/utils';

const assetInfo = btcCryptoAsset;

interface BtcFormProps {
  account: Account;
  availableBalance: Money;
  fiatBalance: Money;
  feeRates: AverageBitcoinFeeRates;
  utxos: OwnedUtxo[];
  marketData: MarketData;
  fiatCurrency: FiatCurrency;
  assetItemAnimationOffsetTop?: number | null;
  onOpenAssetPicker(): void;
}

export function BtcForm({
  fiatBalance,
  availableBalance,
  marketData,
  account,
  utxos,
  feeRates,
  fiatCurrency,
  onOpenAssetPicker,
  assetItemAnimationOffsetTop,
}: BtcFormProps) {
  const {
    state: { inputCurrencyMode },
  } = useSendFlowContext();
  const currency = whenInputCurrencyMode(inputCurrencyMode)({
    crypto: assetInfo.symbol,
    fiat: fiatCurrency,
  });
  const { form, schema, maxSpend, onSetMax, onSubmit } = useBtcForm({ account, feeRates, utxos });

  return (
    <SendFormContainer>
      <AssetDisplay
        name={t({
          id: 'asset_name.bitcoin',
          message: 'Bitcoin',
        })}
        assetInfo={assetInfo}
        availableBalance={availableBalance}
        fiatBalance={fiatBalance}
        icon={<BtcAvatarIcon />}
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
            recipientSchema={schema.sourceType().shape.recipient}
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
              spendableAmount={maxSpend.spendableBitcoin}
              currency={currency}
              value={value}
              onBlur={onBlur}
              onChange={onChange}
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
