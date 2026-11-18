import { type Dispatch, type SetStateAction, useCallback, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { Stack, styled } from 'leather-styles/jsx';
import { z } from 'zod';

import type { BtcFeeType } from '@leather.io/models';
import { Button, Link } from '@leather.io/ui';

import { requiredNumberField } from '@shared/forms/field-schemas';
import type { TransferRecipient } from '@shared/models/form.model';

import { useLatestCallback } from '@app/common/hooks/use-latest-callback';
import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { createFormResolver } from '@app/common/validation/form-resolver';

import { type OnChooseFeeArgs } from '../bitcoin-fees-list/bitcoin-fees-list';
import { BitcoinCustomFeeInput } from './bitcoin-custom-fee-input';
import { useBitcoinCustomFee } from './hooks/use-bitcoin-custom-fee';

interface BitcoinCustomFeeFormValues {
  feeRate: string;
}

interface BitcoinCustomFeeProps {
  amount: number;
  customFeeInitialValue: string;
  hasInsufficientBalanceError: boolean;
  isSendingMax: boolean;
  onChooseFee({ feeRate, feeValue, time, isCustomFee }: OnChooseFeeArgs): Promise<void>;
  onSetSelectedFeeType(value: BtcFeeType | null): void;
  onValidateBitcoinSpend(value: number): boolean;
  recipients: TransferRecipient[];
  setCustomFeeInitialValue: Dispatch<SetStateAction<string>>;
  maxCustomFeeRate: number;
}

export function BitcoinCustomFee({
  customFeeInitialValue,
  hasInsufficientBalanceError,
  isSendingMax,
  onChooseFee,
  onSetSelectedFeeType,
  onValidateBitcoinSpend,
  recipients,
  setCustomFeeInitialValue,
  maxCustomFeeRate,
}: BitcoinCustomFeeProps) {
  const feeInputRef = useRef<HTMLInputElement | null>(null);
  const getCustomFeeValues = useBitcoinCustomFee({
    isSendingMax,
    recipients,
  });

  const onChooseCustomBtcFee = useCallback(
    async ({ feeRate }: BitcoinCustomFeeFormValues) => {
      onSetSelectedFeeType(null);
      const { fee: feeValue } = getCustomFeeValues(Number(feeRate));
      const isValid = onValidateBitcoinSpend(feeValue);
      if (!isValid) return;
      await onChooseFee({ feeRate: Number(feeRate), feeValue, time: '', isCustomFee: true });
    },
    [onSetSelectedFeeType, getCustomFeeValues, onValidateBitcoinSpend, onChooseFee]
  );

  const resolver = createFormResolver<BitcoinCustomFeeFormValues>(
    z.object({
      feeRate: requiredNumberField({
        requiredError: 'Fee is required',
        typeError: 'Fee must be a number',
      }).check(
        z.refine<number>(value => Number.isInteger(value), {
          error: 'Fee must be a whole number',
        }),
        z.refine<number>(value => value <= maxCustomFeeRate, { error: 'Fee is too high' })
      ),
    })
  );

  const form = useForm<BitcoinCustomFeeFormValues>({
    defaultValues: { feeRate: customFeeInitialValue.toString() },
    resolver,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });
  const feeRate = form.watch('feeRate');
  const submitForm = useLatestCallback(onChooseCustomBtcFee);

  return (
    <FormProvider {...form}>
      <form onSubmit={event => void form.handleSubmit(submitForm)(event)}>
        <Stack gap="space.06" mt="space.02">
          <Stack gap="space.05">
            <styled.span color="ink.text-subdued" textStyle="body.02" maxWidth="21.5rem">
              Higher fee rates typically lead to faster confirmation times.
              <Link
                ml="space.01"
                onClick={() => openInNewTab('https://buybitcoinworldwide.com/fee-calculator/')}
                textStyle="body.02"
              >
                View fee calculator
              </Link>
            </styled.span>
            <BitcoinCustomFeeInput
              isSendingMax={isSendingMax}
              onClick={() => feeInputRef.current?.focus()}
              customFeeInitialValue={customFeeInitialValue}
              setCustomFeeInitialValue={setCustomFeeInitialValue}
              recipients={recipients}
              hasInsufficientBalanceError={hasInsufficientBalanceError}
            />
          </Stack>
          <Button
            data-testid={SendCryptoAssetSelectors.PreviewSendTxBtn}
            disabled={!feeRate}
            type="submit"
          >
            Use custom fee
          </Button>
        </Stack>
      </form>
    </FormProvider>
  );
}
