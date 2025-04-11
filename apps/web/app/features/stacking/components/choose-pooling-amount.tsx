import { Controller, useFormContext } from 'react-hook-form';

import BigNumber from 'bignumber.js';
import { Box, Stack, styled } from 'leather-styles/jsx';
import { ErrorLabel } from '~/components/error-label';
import { StackingPoolFormSchema } from '~/features/stacking/utils/stacking-pool-form-schema';
import { toHumanReadableStx } from '~/utils/unit-convert';

import { Button, Input, Spinner } from '@leather.io/ui';
import { microStxToStx } from '@leather.io/utils';

export interface ChoosePoolingAmountProps {
  isLoading: boolean;
  amount: BigNumber | undefined;
}

export function ChoosePoolingAmount({ isLoading, amount }: ChoosePoolingAmountProps) {
  const { setValue, control } = useFormContext<StackingPoolFormSchema>();

  return (
    <Stack>
      <Box>
        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, onBlur, value, ref }, fieldState: { invalid, error } }) => (
            <>
              <Input.Root>
                <Input.Label>Amount of STX to Stack</Input.Label>
                <Input.Field
                  id="amount"
                  value={value ?? ''}
                  onChange={input => {
                    onChange(input.target.value);
                  }}
                  onBlur={onBlur}
                  ref={ref}
                />
              </Input.Root>
              {invalid && error && <ErrorLabel>{error.message}</ErrorLabel>}
            </>
          )}
        />
      </Box>

      <Box textStyle="body.02" color="ink.text-subdued" aria-busy={isLoading}>
        <styled.span textStyle="caption">Available balance:</styled.span>
        {isLoading ? (
          <Spinner />
        ) : amount ? (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            color="#12100F"
            onClick={() => setValue('amount', microStxToStx(amount).toNumber())}
          >
            {toHumanReadableStx(amount)}{' '}
          </Button>
        ) : (
          'Failed to load'
        )}
      </Box>
    </Stack>
  );
}
