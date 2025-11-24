import { useRef, useState } from 'react';

import { useField } from 'formik';
import { Stack } from 'leather-styles/jsx';

import { BitcoinError } from '@leather.io/bitcoin';
import { Input } from '@leather.io/ui';
import { satToBtc } from '@leather.io/utils';

import type { TransferRecipient } from '@shared/models/form.model';

import { useOnMount } from '@app/common/hooks/use-on-mount';

import { ErrorLabel } from '../error-label';
import { BitcoinCustomFeeFiat } from './bitcoin-custom-fee-fiat';
import { useBitcoinCustomFee } from './hooks/use-bitcoin-custom-fee';

const feeInputLabel = 'sats/vB';

interface Props {
  onClick?(): void;
  isSendingMax: boolean;
  recipients: TransferRecipient[];
  hasInsufficientBalanceError: boolean;
  errorMessage?: string;
  setCustomFeeInitialValue?(value: string): void;
  customFeeInitialValue: string;
}

export function BitcoinCustomFeeInput({
  onClick,
  isSendingMax,
  recipients,
  hasInsufficientBalanceError,
  setCustomFeeInitialValue,
  customFeeInitialValue,
}: Props) {
  const [field] = useField('feeRate');

  const [feeValue, setFeeValue] = useState<null | {
    fee: number;
    fiatFeeValue: string;
  }>(null);

  const getCustomFeeValues = useBitcoinCustomFee({
    isSendingMax,
    recipients,
  });
  const [unknownError, setUnknownError] = useState(false);
  const [customInsufficientBalanceError, setCustomInsufficientBalanceError] = useState(false);
  const requestIdRef = useRef(0);

  const hasError = hasInsufficientBalanceError || unknownError || customInsufficientBalanceError;
  const errorMessage =
    hasInsufficientBalanceError || customInsufficientBalanceError
      ? 'Insufficient funds'
      : 'Unknown error';

  async function processFeeValue(feeRate: string) {
    const currentRequestId = ++requestIdRef.current;
    try {
      const feeValues = await getCustomFeeValues(Number(feeRate));
      if (currentRequestId !== requestIdRef.current) return;
      setFeeValue(feeValues);

      setUnknownError(false);
      setCustomInsufficientBalanceError(false);
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      if (err instanceof BitcoinError && err.message === 'InsufficientFunds') {
        return setCustomInsufficientBalanceError(true);
      }

      setUnknownError(true);
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setCustomFeeInitialValue?.(e.target.value);
    void processFeeValue(value);
  }

  useOnMount(() => {
    void processFeeValue(customFeeInitialValue);
  });
  return (
    <Stack gap="space.05">
      <Stack>
        <Input.Root hasError={hasError}>
          <Input.Label>{feeInputLabel}</Input.Label>
          <Input.Field
            onClick={onClick}
            {...field}
            onChange={e => {
              field.onChange(e);
              onChange?.(e);
            }}
          />
        </Input.Root>
        {hasError && <ErrorLabel>{errorMessage}</ErrorLabel>}
      </Stack>

      {!hasError && feeValue && (
        <BitcoinCustomFeeFiat
          feeInBtc={satToBtc(feeValue.fee).toString()}
          fiatFeeValue={feeValue.fiatFeeValue}
        />
      )}
    </Stack>
  );
}
