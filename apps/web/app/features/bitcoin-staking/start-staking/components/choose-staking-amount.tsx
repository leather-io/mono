import { Controller, useFormContext } from 'react-hook-form';

import BigNumber from 'bignumber.js';
import { Box, Stack, styled } from 'leather-styles/jsx';
import { ErrorLabel } from '~/components/error-label';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';

import { Button, Input, Spinner } from '@leather.io/ui';
import { isDefined, microStxToStx } from '@leather.io/utils';

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

      <Box textStyle="body.02" color="ink.text-subdued" aria-busy={isLoading}>
        <styled.span textStyle="caption">Available balance:</styled.span>
        {isLoading && <Spinner />}
        {!isLoading && availableAmount && (
          <Button
            variant="ghost"
            size="md"
            type="button"
            onClick={() => setValue('amount', microStxToStx(availableAmount).toNumber())}
          >
            {toHumanReadableMicroStx(availableAmount)}
          </Button>
        )}
        {!isLoading && !availableAmount && 'Failed to load'}
      </Box>
    </Stack>
  );
}
