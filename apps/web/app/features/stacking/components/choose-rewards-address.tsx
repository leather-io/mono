import { useFormContext } from 'react-hook-form';

import { Box } from 'leather-styles/jsx';
import { ErrorLabel } from '~/components/error-label';
import { StackingPoolFormSchema } from '~/features/stacking/utils/stacking-pool-form-schema';

import { Input } from '@leather.io/ui';

export function ChooseRewardsAddress() {
  const { register, getFieldState } = useFormContext<StackingPoolFormSchema>();

  const { isTouched, error } = getFieldState('rewardAddress');

  const showError = isTouched && error;

  return (
    <Box>
      <Input.Root>
        <Input.Label>Address</Input.Label>
        <Input.Field id="rewardAddress" {...register('rewardAddress')} />
      </Input.Root>
      {showError && <ErrorLabel>{error.message}</ErrorLabel>}
    </Box>
  );
}
