import { Controller, useFormContext } from 'react-hook-form';

import BigNumber from 'bignumber.js';
import { Box, Stack, styled } from 'leather-styles/jsx';
import { ErrorLabel } from '~/components/error-label';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';

import { Button, Input, Spinner } from '@leather.io/ui';
import { isDefined, microStxToStx } from '@leather.io/utils';

export interface ChoosePoolingAmountProps {
  controlName?: string;
  isLoading: boolean;
  availableAmount: BigNumber | undefined;
  stackedAmount?: BigNumber;
}

export function ChoosePoolingAmount({
  controlName = 'amount',
  isLoading,
  availableAmount,
  stackedAmount,
}: ChoosePoolingAmountProps) {
  const { setValue, control } = useFormContext();

  return (
    <Stack>
      <Box>
        <Controller
          control={control}
          name={controlName}
          render={({ field: { onChange, onBlur, value, ref }, fieldState: { invalid, error } }) => (
            <>
              <Input.Root data-shrink={isDefined(value)}>
                <Input.Label>Amount of STX to Stack</Input.Label>
                <Input.Field
                  id={controlName}
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
        {isLoading ? (
          <Spinner />
        ) : availableAmount ? (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            color="#12100F"
            onClick={() => setValue(controlName, microStxToStx(availableAmount).toNumber())}
          >
            {toHumanReadableMicroStx(availableAmount)}
          </Button>
        ) : (
          'Failed to load'
        )}
      </Box>

      {stackedAmount?.isGreaterThan(0) && (
        <Box textStyle="body.02" color="ink.text-subdued" aria-busy={isLoading}>
          <styled.span textStyle="caption">Minimum amount:</styled.span>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            color="#12100F"
            onClick={() => setValue(controlName, microStxToStx(stackedAmount).toNumber())}
          >
            {toHumanReadableMicroStx(stackedAmount)}
          </Button>
        </Box>
      )}
    </Stack>
  );
}
