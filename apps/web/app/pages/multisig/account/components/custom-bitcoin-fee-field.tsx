import { Flex, styled } from 'leather-styles/jsx';
import { formatCryptoPrecise, formatCurrency } from '~/utils/currency-formatter';

import type { Money } from '@leather.io/models';

import { TextField } from '../../components/text-field';

interface CustomBitcoinFeeFieldProps {
  value: string;
  onChange(value: string): void;
  fee?: Money;
  fiat?: Money;
  error?: string;
  isFetching: boolean;
}

export function CustomBitcoinFeeField({
  value,
  onChange,
  fee,
  fiat,
  error,
  isFetching,
}: CustomBitcoinFeeFieldProps) {
  return (
    <Flex direction="column" gap="space.02">
      <TextField
        label="Custom fee rate (sat/vB)"
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
              {isFetching ? 'Calculating fee…' : 'Estimated total fee: '}
              {!isFetching && (fee ? formatCryptoPrecise(fee) : 'Enter a fee rate')}
              {!isFetching && fiat ? ` · ${formatCurrency(fiat)}` : ''}
            </>
          )
        }
      />
      <styled.p textStyle="caption.01" color="ink.text-subdued">
        Low fees may take longer to confirm or be rejected by the network. Higher fees do not
        guarantee faster confirmation.
      </styled.p>
    </Flex>
  );
}
