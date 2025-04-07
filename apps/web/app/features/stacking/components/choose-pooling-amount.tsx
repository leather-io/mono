import { useFormContext } from 'react-hook-form';

import { Box, Stack } from 'leather-styles/jsx';
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
  const { getFieldState, setValue, register } = useFormContext<StackingPoolFormSchema>();

  const { stxAddress } = useLeatherConnect();

  if (!stxAddress) throw new Error('No stx address available');

  const {
    filteredBalanceQuery: { isLoading },
  } = useStxCryptoAssetBalance(stxAddress.address);
  const totalAvailableBalance = useStxAvailableUnlockedBalance(stxAddress.address);

  const { isTouched, error } = getFieldState('amount');
  const showError = isTouched && error;

  return (
    <Stack>
      <Box>
        <Input.Root>
          <Input.Label>Amount of STX to Stack</Input.Label>
          <Input.Field id="stxAmount" {...register('amount')} />
        </Input.Root>

        {showError && <ErrorLabel>{error.message}</ErrorLabel>}
      </Box>

      <Box textStyle="body.02" color="ink.text-subdued" aria-busy={isLoading}>
        Available balance:{' '}
        {isLoading ? (
          <Spinner />
        ) : totalAvailableBalance ? (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            color="#12100F"
            onClick={() =>
              setValue('amount', microStxToStx(totalAvailableBalance.amount).toString())
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
