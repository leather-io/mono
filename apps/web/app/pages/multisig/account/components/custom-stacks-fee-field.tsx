import { Flex, styled } from 'leather-styles/jsx';
import { formatCryptoPrecise, formatCurrency } from '~/utils/currency-formatter';

import type { Money } from '@leather.io/models';

import { TextField } from '../../components/text-field';

interface CustomStacksFeeFieldProps {
  value: string;
  onChange(value: string): void;
  minimumFee?: Money;
  fiat?: Money;
  error?: string;
}

export function CustomStacksFeeField({
  value,
  onChange,
  minimumFee,
  fiat,
  error,
}: CustomStacksFeeFieldProps) {
  return (
    <Flex direction="column" gap="space.02">
      <TextField
        label="Custom fee (STX)"
        value={value}
        onChange={onChange}
        inputMode="decimal"
        placeholder="0.00"
        invalid={Boolean(error)}
        help={
          error ? (
            <styled.span role="alert" color="red.action-primary-default">
              {error}
            </styled.span>
          ) : (
            <>
              {minimumFee
                ? `Minimum: ${formatCryptoPrecise(minimumFee)}`
                : 'Minimum fee available after transaction details are entered and fees are estimated.'}
              {fiat ? ` · ${formatCurrency(fiat)}` : ''}
            </>
          )
        }
      />
      <styled.p textStyle="caption.01" color="ink.text-subdued">
        Lower fees may take longer to confirm. Higher fees do not guarantee faster confirmation.
      </styled.p>
    </Flex>
  );
}
