import { Controller, useFormContext } from 'react-hook-form';

import BigNumber from 'bignumber.js';
import { Box, Stack } from 'leather-styles/jsx';
import { ErrorLabel } from '~/components/error-label';

import { Input } from '@leather.io/ui';
import { isDefined } from '@leather.io/utils';

import { AvailableBalanceRow } from '../../components/available-balance-row';

interface ChooseStakingAmountProps {
  isLoading: boolean;
  availableAmount: BigNumber | undefined;
}

export function ChooseStakingAmount({ isLoading, availableAmount }: ChooseStakingAmountProps) {
  const { setValue, control } = useFormContext();

  return (
    <Stack>
      <Box>
        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, onBlur, value, ref }, fieldState: { invalid, error } }) => (
            <>
              <Input.Root data-shrink={isDefined(value)}>
                <Input.Label>Amount of STX to stake</Input.Label>
                <Input.Field
                  id="amount"
                  value={value ?? ''}
                  onChange={input => onChange(input.target.value)}
                  onBlur={onBlur}
                  ref={ref}
                />
              </Input.Root>
              {invalid && error && <ErrorLabel mt="space.02">{error.message}</ErrorLabel>}
            </>
          )}
        />
      </Box>

      <AvailableBalanceRow
        isLoading={isLoading}
        availableAmount={availableAmount}
        onSelectMax={amount => setValue('amount', amount)}
      />
    </Stack>
  );
}
