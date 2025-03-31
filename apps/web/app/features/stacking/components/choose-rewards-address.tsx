import { useFormContext } from 'react-hook-form';

import { Input } from '@leather.io/ui';

import { StackingFormValues } from '../utils/types';

export function ChooseRewardsAddress() {
  const { register } = useFormContext<StackingFormValues>();
  return (
    <Input.Root>
      <Input.Label>Address</Input.Label>
      <Input.Field id="rewardAddress" {...register('rewardAddress')} />
    </Input.Root>
  );
}
