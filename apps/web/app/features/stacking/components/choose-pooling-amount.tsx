import { Controller, useFormContext } from 'react-hook-form';

import { Box, Stack, styled } from 'leather-styles/jsx';
import { ErrorLabel } from '~/components/error-label';
import { StackingPoolFormSchema } from '~/features/stacking/utils/stacking-pool-form-schema';
import {
  useStxAvailableUnlockedBalance,
  useStxCryptoAssetBalance,
} from '~/queries/balance/account-balance.hooks';
import { useLeatherConnect } from '~/store/addresses';
import { toHumanReadableStx } from '~/utils/unit-convert';

import { Button, Input, Spinner } from '@leather.io/ui';
import { microStxToStx } from '@leather.io/utils';

export function ChoosePoolingAmount() {
  const { setValue, control } = useFormContext<StackingPoolFormSchema>();

  const { stacksAccount: stxAddress } = useLeatherConnect();

  if (!stxAddress) throw new Error('No stx address available');

  const {
    filteredBalanceQuery: { isLoading },
  } = useStxCryptoAssetBalance(stxAddress.address);
  const totalAvailableBalance = useStxAvailableUnlockedBalance(stxAddress.address);

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
        ) : totalAvailableBalance ? (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            color="#12100F"
            onClick={() =>
              setValue('amount', microStxToStx(totalAvailableBalance.amount).toNumber())
            }
          >
            {toHumanReadableStx(totalAvailableBalance.amount)}{' '}
          </Button>
        ) : (
          'Failed to load'
        )}
      </Box>
    </Stack>
  );
}
