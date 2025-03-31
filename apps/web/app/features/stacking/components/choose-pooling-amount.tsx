import { useFormContext } from 'react-hook-form';

import { Box, Stack } from 'leather-styles/jsx';
import {
  useStxAvailableUnlockedBalance,
  useStxCryptoAssetBalance,
} from '~/queries/balance/account-balance.hooks';
import { useLeatherConnect } from '~/store/addresses';
import { toHumanReadableStx } from '~/utils/unit-convert';

import { Button, Input, Spinner } from '@leather.io/ui';
import { microStxToStx } from '@leather.io/utils';

import { StackingFormValues } from '../utils/types';

export function ChoosePoolingAmount() {
  const { getFieldState, setValue, register } = useFormContext<StackingFormValues>();

  const { stxAddress } = useLeatherConnect();

  if (!stxAddress) throw new Error('No stx address available');

  const {
    filteredBalanceQuery: { isLoading },
  } = useStxCryptoAssetBalance(stxAddress.address);
  const totalAvailableBalance = useStxAvailableUnlockedBalance(stxAddress.address);

  const { isTouched, error } = getFieldState('amount');

  return (
    <Stack>
      <Box>
        <Input.Root>
          <Input.Label>Amount of STX to Stack</Input.Label>
          <Input.Field id="stxAmount" {...register('amount')} />
        </Input.Root>
        {
          isTouched && error && `${error.message}`
          // <ErrorLabel>
          //   <ErrorText>{meta.error}</ErrorText>
          // </ErrorLabel>
        }
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
          // <ErrorAlert>Failed to load</ErrorAlert>
        )}
      </Box>
    </Stack>
  );
}
